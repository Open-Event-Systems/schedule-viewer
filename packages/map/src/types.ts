export type MapObject = Readonly<{
  url: string
  type?: string
  noIsometricTransform?: boolean
}>

export type MapLevel = MapObject &
  Readonly<{
    id: string
    type: "level"
    title: string
  }>

export type MapLayer = Readonly<{
  id: string
  title: string
}>

export type MapLocation = Readonly<{
  id: string
  level: string
  title?: string
  description?: string
  aliases?: readonly string[]
  zoomScale?: number
}>

export type MapConfig = Readonly<{
  objects: readonly (MapObject | MapLevel)[]
  layers: readonly MapLayer[]
  locations: readonly MapLocation[]
  width: number
  height: number
  homeURL?: string
}>
