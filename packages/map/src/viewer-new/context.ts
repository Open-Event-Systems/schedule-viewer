import { createContext } from "react"
import type { MapLayer, MapLevel } from "../types-new.js"

type MapViewerLocationSettings = Readonly<{
  id: string
  title?: string
  icon?: string
}>

export type MapViewerContextValue = Readonly<{
  contentWidth?: number
  contentHeight?: number
  levels: readonly MapLevel[]
  layers: readonly MapLayer[]
  flags: readonly string[]
  locations: readonly MapViewerLocationSettings[]
  hiddenLayers: readonly string[]
  currentLevelId: string
  isometric: boolean
  activeLocationId?: string | undefined
}>

export type MapViewerCallbacks = {
  onSetCurrentLevelId?: (id: string) => void
  onSetHiddenLayers?: (layers: Iterable<string>) => void
  onSetSelectedLocation?: (id: string | undefined) => void
  onSetIsometric?: (isometric: boolean) => void
}

export const MapViewerContext = createContext<MapViewerContextValue>({
  levels: [],
  layers: [],
  flags: [],
  locations: [],
  hiddenLayers: [],
  currentLevelId: "",
  isometric: false,
})

export const MapViewerCallbacksContext = createContext<
  MapViewerCallbacks | undefined
>(undefined)
