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

export type MapFlagToggle = Readonly<{
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
  requireFlags: readonly string[]
  excludeFlags: readonly string[]
}>

export type MapConfig = Readonly<{
  objects: readonly (MapObject | MapLevel)[]
  defaultLevel: string
  layers: readonly MapLayer[]
  locations: readonly MapLocation[]
  flagToggles: readonly MapFlagToggle[]
  width: number
  height: number
  homeURL?: string
}>
