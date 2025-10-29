import type { Meta, StoryObj } from "@storybook/react-vite"
import { MapViewer, type MapViewerProps } from "./map-viewer.js"
import type { ComponentType } from "react"

import "../panzoom/panzoom.scss"
import "./map-viewer.scss"
import "./map.scss"

import {
  MapViewerCallbacksContext,
  MapViewerStateContext,
  useMapViewer,
} from "./context.js"
import type { MapConfig } from "../types-new.js"

import lobbySvg from "../../../viewer/public/example-map-lobby.svg"
import f2Svg from "../../../viewer/public/example-map-2f.svg"

type CT = ComponentType<MapViewerProps & { visible?: boolean }>

const meta: Meta<CT> = {
  component: MapViewer,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryObj<CT> = {
  render() {
    const [mapState, mapCallbacks] = useMapViewer(mapCfg)

    return (
      <MapViewerStateContext value={mapState}>
        <MapViewerCallbacksContext value={mapCallbacks}>
          <MapViewer />
        </MapViewerCallbacksContext>
      </MapViewerStateContext>
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
