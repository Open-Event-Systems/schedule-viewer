import { createContext } from "react"
import type { MapLayer, MapLevel } from "../types.js"

type MapViewerLocationSettings = Readonly<{
  id: string
  title?: string
  icon?: string
}>

export type MapViewerContextValue = Readonly<{
  contentWidth?: number
  contentHeight?: number
  levels: Iterable<MapLevel>
  layers: Iterable<MapLayer>
  flags: Iterable<string>
  locationItemInfo: Iterable<MapViewerLocationSettings>
  hiddenLayers: Iterable<string>
  currentLevelId: string
  isometric: boolean
  activeLocationId?: string | undefined
  detailsLocationId?: string | undefined
  zoomLocationId?: string | undefined
}>

export type MapViewerCallbacks = {
  onSetLevelId?: (id: string) => void
  onSetIsometric?: (isometric: boolean) => void
  onSetHiddenLayers?: (layers: Iterable<string>) => void
  onSetActiveLocationId?: (id: string | undefined) => void
  onSetDetailsLocationId?: (id: string | undefined) => void
}

export const MapViewerContext = createContext<MapViewerContextValue>({
  levels: [],
  layers: [],
  flags: [],
  locationItemInfo: [],
  hiddenLayers: [],
  currentLevelId: "",
  isometric: false,
})

export const MapViewerCallbacksContext = createContext<
  MapViewerCallbacks | undefined
>(undefined)
