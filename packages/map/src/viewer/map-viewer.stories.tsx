import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  MapViewer,
  type MapViewerCallbacks,
  type MapViewerProps,
} from "./map-viewer.js"
import { useCallback, useMemo, useReducer } from "react"

import lobbySvg from "../../example-map-lobby.svg"
import f2Svg from "../../example-map-2f.svg"
import logoSvg from "../../example-icon.svg"

import { parseMapConfig, type MapConfigInput } from "../config.js"

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
      objects: mapCfg.objects,
      locationItemInfo: [
        {
          id: "room-1",
          title: "Event 1",
        },
      ],
      locations: mapCfg.locations,
    })

    const callbacks = useMemo<MapViewerCallbacks>(() => {
      return {
        onSetLevelId(id) {
          dispatch({ currentLevelId: id })
        },
        onSetHiddenLayers(layers) {
          dispatch({ hiddenLayers: [...layers] })
        },
        onSetIsometric(isometric) {
          dispatch({ isometric })
        },
        onSetActiveLocationId(id) {
          dispatch({ activeLocationId: id, zoomLocationId: id })
        },
        onSetDetailsLocationId(id) {
          dispatch({ detailsLocationId: id })
        },
      }
    }, [dispatch])

    return (
      <MapViewer
        contentWidth={state.contentWidth}
        contentHeight={state.contentHeight}
        currentLevelId={state.currentLevelId}
        objects={state.objects}
        layers={state.layers}
        isometric={state.isometric}
        hiddenLayers={state.hiddenLayers}
        locations={state.locations}
        locationItemInfo={state.locationItemInfo}
        flags={state.flags}
        activeLocationId={state.activeLocationId}
        detailsLocationId={state.detailsLocationId}
        zoomLocationId={state.zoomLocationId}
        onSetLevelId={callbacks.onSetLevelId}
        onSetHiddenLayers={callbacks.onSetHiddenLayers}
        onSetActiveLocationId={callbacks.onSetActiveLocationId}
        onSetIsometric={callbacks.onSetIsometric}
        onSetDetailsLocationId={callbacks.onSetDetailsLocationId}
      />
    )
  },
}

const mapCfgInput = {
  objects: [
    { type: "level", id: "lobby", title: "Lobby", url: lobbySvg },
    { type: "level", id: "2f", title: "2F", url: f2Svg },
    { type: "logo", url: logoSvg, noIsometricTransform: true },
  ],
  defaultLevel: "lobby",
  layers: [
    { id: "text", title: "Text" },
    { id: "detail", title: "Detail" },
  ],
  locations: [
    {
      id: "room-1",
      title: "Room 1",
      description: "Room 1",
      level: "lobby",
    },
    {
      id: "room-2",
      title: "Room 2",
      description: "Room 2",
      level: "2f",
    },
  ],
  width: 960,
  height: 960,
} as const satisfies MapConfigInput

const mapCfg = parseMapConfig(mapCfgInput)
