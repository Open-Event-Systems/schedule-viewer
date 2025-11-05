export type MapLevel = Readonly<{
  id: string
  title: string
  url: string
}>

export type MapLayer = Readonly<{
  id: string
  title: string
}>

export type MapLocation = Readonly<{
  id: string
  title?: string
  description?: string
}>

export type MapConfig = Readonly<{
  levels: readonly MapLevel[]
  layers: readonly MapLayer[]
  locations: readonly MapLocation[]
  width: number
  height: number
  homeURL?: string
}>
