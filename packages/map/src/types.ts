export type MapLevel = Readonly<{
  id: string
  title: string
}>

export type MapLayer = Readonly<{
  id: string
  title: string
}>

export type MapLocation = Readonly<{
  id: string
  title: string
  type?: "location" | "vendor"
  description?: string
  aliases?: readonly string[]
}>

export type MapVendor = Readonly<{
  name: string
  location: string
  description?: string
  icon?: string
}>

export type TimedMapFlag = Readonly<{
  flag: string
  start?: string
  end?: string
}>

export interface MapConfig {
  readonly src: string
  readonly levels: readonly MapLevel[]
  readonly defaultLevel: string
  readonly layers: readonly MapLayer[]
  readonly locations: readonly MapLocation[]
  readonly vendors: readonly MapVendor[]
  readonly flags: readonly (string | TimedMapFlag)[]
}

export interface MapEvent {
  readonly id: string
  readonly title?: string
  readonly start?: Date
  readonly end?: Date
  readonly location?: string
}

export type MapState = {
  readonly config: MapConfig
  readonly locations: ReadonlyMap<string, MapLocation>

  get level(): string
  setLevel(level: string): void

  get hiddenLayers(): ReadonlySet<string>
  setHiddenLayers(hidden: Iterable<string>): void

  get isometric(): boolean
  setIsometric(set: boolean): void

  get highlightId(): string | null
  setHighlightId(id: string | null): void

  get selectedId(): string | null
  setSelectedId(id: string | null): void

  zoomTo(id: string): void
}
