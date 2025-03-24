import { makeAutoObservable, observable, reaction } from "mobx"
import { MapConfig, MapLocation, MapState } from "./types.js"
import { getMapLocations } from "./map.js"

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

class _MapState {
  public locations: ReadonlyMap<string, MapLocation>
  public level: string
  public hiddenLayers: ReadonlySet<string> = new Set()
  public isometric = false
  public highlightId: string | null = null
  public selectedId: string | null = null

  constructor(
    public config: MapConfig,
    svgData: string,
  ) {
    this.locations = getMapLocations(config)
    this.level = config.defaultLevel

    makeAutoObservable<this>(this, {
      config: false,
      locations: false,
      hiddenLayers: observable.ref,
    })
  }

  setLevel(level: string) {
    this.level = level
  }

  setHiddenLayers(layers: Iterable<string>) {
    this.hiddenLayers = new Set(layers)
  }

  setIsometric(iso: boolean) {
    this.isometric = iso
  }

  setHighlightId(id: string | null) {
    this.highlightId = id
  }

  setSelectedId(id: string | null) {
    this.highlightId = id
  }

  zoomTo(id: string) {}
}

export const makeMapState = (config: MapConfig): MapState => {
  return new _MapState(config)
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
