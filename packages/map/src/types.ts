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
  description?: string
  aliases?: readonly string[]
}>

export interface MapConfig {
  readonly src: string
  readonly levels: readonly MapLevel[]
  readonly defaultLevel: string
  readonly layers: readonly MapLayer[]
  readonly locations: readonly MapLocation[]
}
