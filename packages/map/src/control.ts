import {
  action,
  computed,
  makeAutoObservable,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx"
// import panzoom, { PanZoom } from "panzoom"
import { MapConfig } from "./types.js"
// import Panzoom, { PanzoomObject } from "@panzoom/panzoom"
import { fixedZoomToPoint } from "./zoomfix.js"
import { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch"

export const MAP_LEVEL_CLASS = "Map-level"
export const MAP_LEVEL_CLASS_PREFIX = "Map-level-id-"

export const MAP_MARKER_CLASS = "Map-marker"
export const MAP_MARKER_CLASS_PREFIX = "Map-marker-id-"

export const MAP_AREA_CLASS = "Map-area"
export const MAP_AREA_CLASS_PREFIX = "Map-area-id-"

export const MAP_CLICK_CLASS = "Map-click"
export const MAP_CLICK_CLASS_PREFIX = "Map-click-id-"

export const MAP_LAYER_CLASS = "Map-layer"
export const MAP_LAYER_CLASS_PREFIX = "Map-layer-id-"

export const MAP_ISOMETRIC_CLASS = "Map-isometric"
export const MAP_ISOMETRIC_TRANSFORM_CLASS = "Map-isometric-transform"

export const MAP_VISIBLE_CLASS = "Map-visible"
export const MAP_HIDDEN_CLASS = "Map-hidden"
export const MAP_HIGHLIGHT_CLASS = "Map-highlight"

export class MapControl {
  private svgElement: SVGSVGElement | null = null
  private context: ReactZoomPanPinchContentRef | null = null
  private _hiddenLayers: ReadonlySet<string> = new Set()
  private _level: string
  private _isometric = false
  private _highlight: string | null = null
  // private _panzoom: PanzoomObject | null = null
  public dispose: () => void

  constructor(
    public config: MapConfig,
    public onSelect?: (id: string | null) => void,
  ) {
    makeAutoObservable<this, "_hiddenLayers">(this, {
      _hiddenLayers: observable.ref,
      dispose: false,
      onSelect: false,
    })

    this._level = config.defaultLevel

    const disposeFuncs = [
      reaction(
        () => [this._hiddenLayers, this.svgElement] as const,
        ([newHiddenLayers]) => {
          this.updateLayers(newHiddenLayers)
        },
      ),
      reaction(
        () => [this._level, this.svgElement] as const,
        ([newLevel]) => {
          this.updateLevel(newLevel)
        },
      ),
      reaction(
        () => [this._isometric, this.svgElement] as const,
        ([iso]) => {
          this.updateIsoDelayed(iso)
        },
      ),
      reaction(
        () => [this._highlight, this.svgElement] as const,
        ([highlight]) => {
          this.updateHighlight(highlight)
        },
      ),
    ]

    this.dispose = () => {
      for (const f of disposeFuncs) {
        f()
      }
    }
  }

  get hiddenLayers(): ReadonlySet<string> {
    return this._hiddenLayers
  }

  set hiddenLayers(layers: Iterable<string>) {
    this._hiddenLayers = new Set(layers)
  }

  get level(): string {
    return this._level
  }

  set level(level: string) {
    this._level = level
  }

  get isometric(): boolean {
    return this._isometric
  }

  set isometric(iso: boolean) {
    this._isometric = iso
  }

  get highlight(): string | null {
    return this._highlight
  }

  set highlight(highlight: string | null) {
    this._highlight = highlight
  }

  zoomTo(id: string) {
    const className = toCSSClass(MAP_AREA_CLASS_PREFIX, id)
    const els = this.svgElement?.getElementsByClassName(className) ?? []
    const el = els[0]
    if (el && this.context) {
      this.context.zoomToElement(el as HTMLElement)
    }
  }

  async setup(
    el: SVGSVGElement,
    context: ReactZoomPanPinchContentRef,
  ): Promise<() => void> {
    const disposeFuncs: (() => void)[] = []

    const transitionHandler = () => {
      this.updateIso(this._isometric)
    }

    el.addEventListener("transitionend", transitionHandler)

    disposeFuncs.push(() =>
      el.removeEventListener("transitionend", transitionHandler),
    )

    runInAction(() => {
      this.svgElement = el
      this.context = context
    })

    this.clickElements.forEach((el) => {
      if (el instanceof SVGElement) {
        const classes = Array.from(el.classList, (c) =>
          parseCSSClass(c, MAP_CLICK_CLASS_PREFIX),
        )
        const clickId = classes.find((v) => !!v)
        if (clickId) {
          const clickHandler = (e: MouseEvent) => {
            e.stopPropagation()
            this.onSelect && this.onSelect(clickId)
          }
          el.addEventListener("click", clickHandler)
          disposeFuncs.push(() => el.removeEventListener("click", clickHandler))
        }
      }
    })

    const clickHandler = () => {
      this.onSelect && this.onSelect(null)
    }

    el.addEventListener("click", clickHandler)
    disposeFuncs.push(() => el.removeEventListener("click", clickHandler))

    return () => {
      for (const f of disposeFuncs) {
        f()
      }
    }
  }

  private get layerElements(): readonly Element[] {
    return Array.from(
      this.svgElement?.getElementsByClassName(MAP_LAYER_CLASS) ?? [],
    )
  }

  private get levelElements(): readonly Element[] {
    return Array.from(
      this.svgElement?.getElementsByClassName(MAP_LEVEL_CLASS) ?? [],
    )
  }

  private get areaElements(): readonly Element[] {
    return Array.from(
      this.svgElement?.getElementsByClassName(MAP_AREA_CLASS) ?? [],
    )
  }

  private get clickElements(): readonly Element[] {
    return Array.from(
      this.svgElement?.getElementsByClassName(MAP_CLICK_CLASS) ?? [],
    )
  }

  private updateLayers(hiddenLayers: Iterable<string>) {
    const layerClassNames = Array.from(hiddenLayers, (layer) =>
      toCSSClass(MAP_LAYER_CLASS_PREFIX, layer),
    )
    this.layerElements.forEach((el) => {
      if (layerClassNames.some(el.classList.contains)) {
        setHidden(el, true)
      } else {
        setHidden(el, false)
      }
    })
  }

  private updateLevel(level: string) {
    const className = toCSSClass(MAP_LEVEL_CLASS_PREFIX, level)
    this.levelElements.forEach((el) => {
      if (el.classList.contains(className)) {
        setVisible(el, true)
      } else {
        setVisible(el, false)
      }
    })
  }

  private updateIso(iso: boolean) {
    if (iso) {
      this.svgElement?.classList.add(MAP_ISOMETRIC_CLASS)
      this.svgElement?.classList.add(MAP_ISOMETRIC_TRANSFORM_CLASS)
    } else {
      this.svgElement?.classList.remove(MAP_ISOMETRIC_TRANSFORM_CLASS)
      this.svgElement?.classList.remove(MAP_ISOMETRIC_CLASS)
    }
  }

  private updateIsoDelayed(iso: boolean) {
    if (iso) {
      this.svgElement?.classList.add(MAP_ISOMETRIC_CLASS)
      window.setTimeout(() => {
        this.svgElement?.classList.add(MAP_ISOMETRIC_TRANSFORM_CLASS)
      }, 50)
    } else {
      this.svgElement?.classList.remove(MAP_ISOMETRIC_TRANSFORM_CLASS)
    }
  }

  private updateHighlight(highlight: string | null) {
    const className = highlight
      ? toCSSClass(MAP_AREA_CLASS_PREFIX, highlight)
      : null
    this.areaElements.forEach((el) => {
      if (className && el.classList.contains(className)) {
        el.classList.add(MAP_HIGHLIGHT_CLASS)
      } else {
        el.classList.remove(MAP_HIGHLIGHT_CLASS)
      }
    })
  }
}

const setVisible = (el: Element, visible: boolean) => {
  // hack: unset inline display styles
  if (hasStyle(el)) {
    el.style.display = ""
  }

  if (visible) {
    el.classList.add(MAP_VISIBLE_CLASS)
  } else {
    el.classList.remove(MAP_VISIBLE_CLASS)
  }
}

const setHidden = (el: Element, hidden: boolean) => {
  // hack: unset inline display styles
  if (hasStyle(el)) {
    el.style.display = ""
  }

  if (hidden) {
    el.classList.add(MAP_HIDDEN_CLASS)
  } else {
    el.classList.remove(MAP_HIDDEN_CLASS)
  }
}

const hasStyle = <T extends Element>(
  el: T,
): el is T & ElementCSSInlineStyle => {
  return "style" in el && typeof el.style == "object"
}

const toCSSClass = (prefix: string, id: string): string => {
  return `${prefix}${id}`
}

const parseCSSClass = (cls: string, prefix: string): string | null => {
  if (cls.startsWith(prefix)) {
    return cls.substring(prefix.length)
  } else {
    return null
  }
}

const getZoom = (
  rootEl: SVGSVGElement,
  childEl: Element,
  scale: number,
): [number, number] => {
  const childBound = childEl.getBoundingClientRect()
  const rootBound = rootEl.getBoundingClientRect()

  const childX = childBound.left + childBound.width / 2
  const childY = childBound.top + childBound.height / 2

  const boundX = rootBound.width / 2
  const boundY = rootBound.height / 2

  const diffX = boundX - childX
  const diffY = boundY - childY
  console.log(diffX, diffY)
  console.log(scale)

  return [diffX, diffY]
}
