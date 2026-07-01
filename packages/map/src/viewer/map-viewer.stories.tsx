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
        action:
          | Partial<MapViewerProps>
          | ((cur: MapViewerProps) => Partial<MapViewerProps>),
      ): MapViewerProps => {
        if (typeof action == "function") {
          return {
            ...cur,
            ...action(cur),
          }
        } else {
          return {
            ...cur,
            ...action,
          }
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
          name: "Event 1",
        },
      ],
      locations: mapCfg.locations,
      flagToggles: mapCfg.flagToggles,
    })

    const callbacks = useMemo<MapViewerCallbacks>(() => {
      return {
        onSetLevelId(id) {
          dispatch({ currentLevelId: id })
        },
        onSetLayerVisible(layer, visible) {
          dispatch((cur) => {
            const newLayers = new Set(cur.hiddenLayerIds)
            if (visible) {
              newLayers.delete(layer)
            } else {
              newLayers.add(layer)
            }
            return {
              ...cur,
              hiddenLayerIds: [...newLayers],
            }
          })
        },
        onSetFlag(flag, enabled) {
          dispatch((cur) => {
            const newFlags = new Set(cur.flags)
            if (enabled) {
              newFlags.add(flag)
            } else {
              newFlags.delete(flag)
            }
            return {
              ...cur,
              flags: [...newFlags],
            }
          })
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
        hiddenLayerIds={state.hiddenLayerIds}
        locations={state.locations}
        locationItemInfo={state.locationItemInfo}
        flags={state.flags}
        flagToggles={mapCfg.flagToggles}
        activeLocationId={state.activeLocationId}
        detailsLocationId={state.detailsLocationId}
        zoomLocationId={state.zoomLocationId}
        onSetLevelId={callbacks.onSetLevelId}
        onSetLayerVisible={callbacks.onSetLayerVisible}
        onSetFlag={callbacks.onSetFlag}
        onSetActiveLocationId={callbacks.onSetActiveLocationId}
        onSetIsometric={callbacks.onSetIsometric}
        onSetDetailsLocationId={callbacks.onSetDetailsLocationId}
      />
    )
  },
}

const mapCfgInput = {
  objects: [
    { type: "level", id: "lobby", name: "Lobby", url: lobbySvg },
    { type: "level", id: "2f", name: "2F", url: f2Svg },
    { type: "logo", url: logoSvg, noIsometricTransform: true },
  ],
  defaultLevel: "lobby",
  layers: [
    { id: "text", name: "Text" },
    { id: "detail", name: "Detail" },
  ],
  locations: [
    {
      id: "room-1",
      name: "Room 1",
      description: "Room 1",
      level: "lobby",
    },
    {
      id: "room-2",
      name: "Room 2",
      description: "Room 2",
      level: "2f",
    },
  ],
  width: 960,
  height: 960,
} as const satisfies MapConfigInput

const mapCfg = parseMapConfig(mapCfgInput)
