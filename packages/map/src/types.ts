export type MapLevel = Readonly<{
  id: string
  title: string
  url: string
}>

export type MapLayer = Readonly<{
  id: string
  title: string
}>

export type MapConfig = Readonly<{
  levels: readonly MapLevel[]
  layers: readonly MapLayer[]
  width: number
  height: number
  homeURL?: string
}>
