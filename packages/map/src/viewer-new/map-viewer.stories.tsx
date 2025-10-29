import type { Meta, StoryObj } from "@storybook/react-vite"
import { MapViewer } from "./map-viewer.js"
import {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  type ComponentType,
} from "react"

import "../panzoom/panzoom.scss"
import "./map-viewer.scss"
import "./map.scss"

import {
  MapViewerCallbacksContext,
  MapViewerContext,
  type MapViewerCallbacks,
  type MapViewerContextValue,
} from "./context.js"
import type { MapConfig } from "../types-new.js"

import lobbySvg from "../../../viewer/public/example-map-lobby.svg"
import f2Svg from "../../../viewer/public/example-map-2f.svg"

const meta: Meta<typeof MapViewer> = {
  component: MapViewer,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryObj<typeof MapViewer> = {
  render() {
    const reducer = useCallback(
      (
        cur: MapViewerContextValue,
        action: Partial<MapViewerContextValue>,
      ): MapViewerContextValue => {
        return {
          ...cur,
          ...action,
        }
      },
      [],
    )

    const [state, dispatch] = useReducer(reducer, {
      currentLevelId: "lobby",
      flags: ["test"],
      hiddenLayers: [],
      isometric: false,
      layers: mapCfg.layers,
      levels: mapCfg.levels,
      contentHeight: 960,
      contentWidth: 960,
      locations: [
        {
          id: "room-1",
          title: "Event 1",
        },
      ],
    })

    const callbacks = useMemo<MapViewerCallbacks>(() => {
      return {
        onSetCurrentLevelId(id) {
          dispatch({ currentLevelId: id })
        },
        onSetHiddenLayers(layers) {
          dispatch({ hiddenLayers: [...layers] })
        },
        onSetIsometric(isometric) {
          dispatch({ isometric })
        },
        onSetSelectedLocation(id) {
          dispatch({ activeLocationId: id })
        },
      }
    }, [dispatch])

    return (
      <MapViewerContext value={state}>
        <MapViewerCallbacksContext value={callbacks}>
          <MapViewer
            frameWidth={window.innerWidth}
            frameHeight={window.innerHeight}
          />
        </MapViewerCallbacksContext>
      </MapViewerContext>
    )
  },
}

const mapCfg = {
  levels: [
    { id: "lobby", title: "Lobby", url: lobbySvg },
    { id: "2f", title: "2F", url: f2Svg },
  ],
  layers: [
    { id: "text", title: "Text" },
    { id: "detail", title: "Detail" },
  ],
} as const satisfies MapConfig
