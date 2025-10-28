import { createContext, useMemo, useReducer } from "react"
import { MapConfig, MapLayer, MapLevel } from "../types-new.js"

type MapViewerState = Readonly<{
  levels: readonly MapLevel[]
  layers: readonly MapLayer[]
  hiddenLayers: ReadonlySet<string>
  currentLevelId: string
  isometric: boolean
}>

export type MapViewerCallbacks = Readonly<{
  setCurrentLevelId(id: string): void
  setIsometric(isometric: boolean): void
  setHiddenLayers(layers: Iterable<string>): void
}>

export const MapViewerStateContext = createContext<MapViewerState>({
  levels: [],
  layers: [],
  hiddenLayers: new Set(),
  currentLevelId: "",
  isometric: false,
})
export const MapViewerCallbacksContext = createContext<MapViewerCallbacks>({
  setCurrentLevelId() {},
  setIsometric() {},
  setHiddenLayers() {},
})

export const useMapViewer = (
  config: MapConfig,
): [MapViewerState, MapViewerCallbacks] => {
  const init = (): MapViewerState => {
    const initLevelId = config.levels[0].id ?? "" // TODO: get from config

    return {
      levels: config.levels,
      layers: config.layers,
      hiddenLayers: new Set(),
      currentLevelId: initLevelId,
      isometric: false,
    }
  }

  const reducer = (
    cur: MapViewerState,
    action: Partial<MapViewerState>,
  ): MapViewerState => {
    return { ...cur, ...action }
  }

  const [state, dispatch] = useReducer(reducer, {}, init)

  const callbacks = useMemo((): MapViewerCallbacks => {
    return {
      setCurrentLevelId(currentLevelId) {
        dispatch({ currentLevelId })
      },
      setIsometric(isometric) {
        dispatch({ isometric })
      },
      setHiddenLayers(layers) {
        console.log("doing", layers)
        dispatch({ hiddenLayers: new Set(layers) })
      },
    }
  }, [dispatch])

  return [state, callbacks]
}
