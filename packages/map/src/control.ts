import { makeAutoObservable, observable, reaction } from "mobx"
import { MapConfig } from "./types.js"

export const MAP_CLASSES = {
  level: "Map-level",
  levelPrefix: "Map-level-id-",
  marker: "Map-marker",
  markerPrefix: "Map-marker-id-",
  area: "Map-area",
  areaPrefix: "Map-area-id-",
  click: "Map-click",
  clickPrefix: "Map-click-id-",
  layer: "Map-layer",
  layerPrefix: "Map-layer-id-",
  isometric: "Map-isometric",
  isometricTransform: "Map-isometric-transform",
  visible: "Map-visible",
  hidden: "Map-hidden",
  highlight: "Map-highlight",
} as const

export class MapControl {
  private mapEl: SVGSVGElement | null = null
  private focusFunc: ((el: SVGElement) => void) | null = null
  public level: string
  public hiddenLayers: ReadonlySet<string> = new Set()
  public isometric = false
  public highlight: string | null = null
  private disposeFuncs: (() => void)[] = []

  constructor(public config: MapConfig) {
    this.level = config.defaultLevel
    makeAutoObservable<this, "mapEl" | "focusFunc" | "hiddenLayers">(this, {
      config: false,
      mapEl: observable.ref,
      hiddenLayers: observable.ref,
      focusFunc: false,
    })

    this.disposeFuncs.push(
      reaction(
        () => [this.level, this.mapEl],
        () => this.updateLevel(),
        { fireImmediately: true },
      ),
    )

    this.disposeFuncs.push(
      reaction(
        () => [this.hiddenLayers, this.mapEl],
        () => this.updateLayers(),
        { fireImmediately: true },
      ),
    )

    this.disposeFuncs.push(
      reaction(
        () => [this.isometric, this.mapEl],
        () => this.updateIsometricDelayed(),
      ),
    )

    this.disposeFuncs.push(
      reaction(
        () => [this.highlight, this.mapEl],
        () => this.updateHighlight(),
        { fireImmediately: true },
      ),
    )
  }

  dispose() {
    for (const f of this.disposeFuncs) {
      f()
    }
  }

  setLevel(level: string) {
    this.level = level
  }

  setHiddenLayers(layers: Iterable<string>) {
    this.hiddenLayers = new Set(layers)
  }

  setIsometric(isometric: boolean) {
    this.isometric = isometric
  }

  setup(
    element: SVGSVGElement,
    focusFunc: (el: SVGElement) => void,
  ): () => void {
    const disposeFuncs: (() => void)[] = []

    element.addEventListener("click", this.clickHandler)
    disposeFuncs.push(() =>
      element.removeEventListener("click", this.clickHandler),
    )

    element.addEventListener("transitionend", this.transitionHandler)
    disposeFuncs.push(() =>
      element.removeEventListener("transitionend", this.transitionHandler),
    )

    this.mapEl = element
    this.focusFunc = focusFunc

    const disposer = () => {
      for (const f of disposeFuncs) {
        f()
      }
    }

    return disposer
  }

  private clickHandler = (event: MouseEvent) => {
    const el = event.target
    if (el instanceof SVGElement && el.classList.contains(MAP_CLASSES.click)) {
      const clickIds = Array.from(el.classList, (cls) =>
        getIDFromCSSClass(MAP_CLASSES.clickPrefix, cls),
      )
      const clickId = clickIds.find((cls) => !!cls)
      if (clickId) {
        event.stopPropagation()
        this.highlight = clickId
      }
    } else {
      this.highlight = null
    }
  }

  private transitionHandler = () => {
    this.updateIsometric()
  }

  private updateLevel() {
    const className = getCSSClass(MAP_CLASSES.levelPrefix, this.level)
    const els = this.mapEl?.getElementsByClassName(MAP_CLASSES.level) ?? []
    for (const el of els) {
      removeInlineDisplay(el)
      if (el.classList.contains(className)) {
        el.classList.add(MAP_CLASSES.visible)
      } else {
        el.classList.remove(MAP_CLASSES.visible)
      }
    }
  }

  private updateLayers() {
    const hiddenClassNames = Array.from(this.hiddenLayers, (layer) =>
      getCSSClass(MAP_CLASSES.layerPrefix, layer),
    )

    const els = this.mapEl?.getElementsByClassName(MAP_CLASSES.layer) ?? []
    for (const el of els) {
      removeInlineDisplay(el)
      if (hiddenClassNames.some((cls) => el.classList.contains(cls))) {
        el.classList.add(MAP_CLASSES.hidden)
      } else {
        el.classList.remove(MAP_CLASSES.hidden)
      }
    }
  }

  private updateIsometric() {
    if (this.isometric) {
      this.mapEl?.classList.add(MAP_CLASSES.isometric)
      this.mapEl?.classList.add(MAP_CLASSES.isometricTransform)
    } else {
      this.mapEl?.classList.remove(MAP_CLASSES.isometric)
      this.mapEl?.classList.remove(MAP_CLASSES.isometricTransform)
    }
  }

  private updateIsometricDelayed() {
    if (this.isometric) {
      this.mapEl?.classList.add(MAP_CLASSES.isometric)
      window.setTimeout(() => {
        this.mapEl?.classList.add(MAP_CLASSES.isometricTransform)
      }, 50)
    } else {
      this.mapEl?.classList.remove(MAP_CLASSES.isometricTransform)
    }
  }

  private updateHighlight() {
    let highlightEl
    const els = this.mapEl?.getElementsByClassName(MAP_CLASSES.area) ?? []
    const highlightClass = this.highlight
      ? getCSSClass(MAP_CLASSES.areaPrefix, this.highlight)
      : null
    for (const el of els) {
      if (highlightClass && el.classList.contains(highlightClass)) {
        el.classList.add(MAP_CLASSES.highlight)
        highlightEl = el
      } else {
        el.classList.remove(MAP_CLASSES.highlight)
      }
    }

    if (highlightEl && this.focusFunc) {
      this.focusFunc(highlightEl as SVGElement)
    }
  }
}

const getCSSClass = (prefix: string, id: string): string => {
  return `${prefix}${id}`
}

const getIDFromCSSClass = (prefix: string, cls: string): string | undefined => {
  if (cls.startsWith(prefix)) {
    return cls.substring(prefix.length)
  }
}

const removeInlineDisplay = (el: Element) => {
  if (el instanceof HTMLElement || el instanceof SVGElement) {
    el.style.display = ""
  }
}
