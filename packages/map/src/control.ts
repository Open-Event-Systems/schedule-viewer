import { action, computed, makeObservable, observable, runInAction } from "mobx"
import panzoom from "panzoom"
import { MapConfig, MapLevel } from "./types.js"
import { TransitionEvent } from "react"

export const MAP_LEVEL_CLASS = "Map-level"
export const MAP_LEVEL_CLASS_PREFIX = "Map-level-id-"

export const MAP_MARKER_CLASS = "Map-marker"
export const MAP_MARKER_CLASS_PREFIX = "Map-marker-id-"

export const MAP_LAYER_CLASS = "Map-layer"
export const MAP_LAYER_CLASS_PREFIX = "Map-layer-id-"

export const MAP_ISOMETRIC_CLASS = "Map-isometric"

export const MAP_VISIBLE_CLASS = "Map-visible"
export const MAP_HIDDEN_CLASS = "Map-hidden"

export class MapControl {
  private wrapperEl: HTMLElement | null = null
  private readyPromise: Promise<this>
  private resolveReady: (v: this) => void
  private _selectedLevel: string
  private _iso = false

  constructor(public config: MapConfig) {
    let resolve: (v: this) => void = () => {}
    this.readyPromise = new Promise((r) => {
      resolve = r
    })
    this.resolveReady = resolve

    this._selectedLevel = this.config.defaultLevel

    makeObservable<
      this,
      "wrapperEl" | "svgElement" | "_selectedLevel" | "_iso"
    >(this, {
      wrapperEl: observable.ref,
      svgElement: computed,
      _selectedLevel: observable,
      setSelectedLevel: action,
      _iso: observable,
      setIsometric: action,
    })
  }

  get ready(): Promise<this> {
    return this.readyPromise
  }

  get selectedLevel(): string {
    return this._selectedLevel
  }

  setSelectedLevel(level: string) {
    this._selectedLevel = level
    this.syncLevels()
  }

  get isIsometric(): boolean {
    return this._iso
  }

  setIsometric(iso: boolean) {
    this._iso = iso
    if (this._iso) {
      this.syncLevels()
      this.syncLayers()
      window.setTimeout(() => this.syncIso(), 50)
    } else {
      this.syncIso()
    }
  }

  private get svgElement(): SVGSVGElement | null {
    if (!this.wrapperEl) {
      return null
    }

    const els = this.wrapperEl.getElementsByTagName("svg")
    if (els.length > 0) {
      return els[0]
    } else {
      return null
    }
  }

  async mount(el: HTMLElement) {
    const resp = await fetch(this.config.src)
    if (!resp.ok) {
      throw new Error(`SVG load returned error ${resp.status}`)
    }

    const doc = await resp.text()
    el.innerHTML = doc
    panzoom(el)

    for (const lvlEl of el.getElementsByClassName(MAP_LEVEL_CLASS)) {
      ;(lvlEl as HTMLElement).addEventListener("transitionend", () => {
        this.syncLayers()
        this.syncLevels()
      })
    }

    runInAction(() => {
      this.wrapperEl = el
    })
    this.resolveReady(this)
  }

  syncLevels() {
    const levelEls = (this.svgElement?.getElementsByClassName(
      MAP_LEVEL_CLASS
    ) ?? []) as HTMLCollectionOf<SVGElement>
    for (const el of levelEls) {
      el.style.display = "" // hack: unset any inline display styles
      el.classList.remove(MAP_VISIBLE_CLASS)
    }

    for (const level of this.config.levels) {
      if (this._iso || this.selectedLevel == level.id) {
        const cls = `${MAP_LEVEL_CLASS_PREFIX}${level.id}`
        const el = this.svgElement?.getElementsByClassName(cls)
        if (el && el.length > 0) {
          el[0].classList.add(MAP_VISIBLE_CLASS)
        }
      }
    }
  }

  syncLayers() {
    const layerEls = (this.svgElement?.getElementsByClassName(
      MAP_LAYER_CLASS
    ) ?? []) as HTMLCollectionOf<SVGElement>
    for (const el of layerEls) {
      el.style.display = "" // hack: unset any inline display styles
      el.classList.remove(MAP_HIDDEN_CLASS)
    }

    for (const layer of this.config.layers) {
      if (this._iso && layer.id == "background") {
        const cls = `${MAP_LAYER_CLASS_PREFIX}${layer.id}`
        const el = this.svgElement?.getElementsByClassName(cls)
        if (el && el.length > 0) {
          el[0].classList.add(MAP_HIDDEN_CLASS)
        }
      }
    }
  }

  syncIso() {
    if (this._iso) {
      this.svgElement?.classList.add(MAP_ISOMETRIC_CLASS)
    } else {
      this.svgElement?.classList.remove(MAP_ISOMETRIC_CLASS)
    }
  }
}

// const getLevelClass = (name: string): string => {
//   const re = new RegExp("\\s+", "g")
//   const normName = name.trim().toLowerCase().replaceAll(re, "-")
//   return `${MAP_LEVEL_CLASS_PREFIX}${normName}`
// }
