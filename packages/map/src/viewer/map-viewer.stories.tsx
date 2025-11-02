import type { Meta, StoryObj } from "@storybook/react-vite"
import { MapViewer, type MapViewerProps } from "./map-viewer.js"
import { useCallback, useMemo, useReducer } from "react"

import { type MapViewerCallbacks } from "./context.js"
import type { MapConfig } from "../types.js"

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
        cur: MapViewerProps,
        action: Partial<MapViewerProps>,
      ): MapViewerProps => {
        return {
          ...cur,
          ...action,
        }
      },
      [],
    )

    const [state, dispatch] = useReducer(reducer, {
      contentWidth: mapCfg.width,
      contentHeight: mapCfg.height,
      currentLevelId: "lobby",
      layers: mapCfg.layers,
      levels: mapCfg.levels,
      locationInfo: [
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
      <MapViewer
        contentWidth={state.contentWidth}
        contentHeight={state.contentHeight}
        currentLevelId={state.currentLevelId}
        levels={state.levels}
        layers={state.layers}
        isometric={state.isometric}
        hiddenLayers={state.hiddenLayers}
        locationInfo={state.locationInfo}
        flags={state.flags}
        activeLocationId={state.activeLocationId}
        onSetLevelId={callbacks.onSetCurrentLevelId}
        onSetHiddenLayers={callbacks.onSetHiddenLayers}
        onSetActiveLocationId={callbacks.onSetSelectedLocation}
        onSetIsometric={callbacks.onSetIsometric}
      />
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
  width: 960,
  height: 960,
} as const satisfies MapConfig
