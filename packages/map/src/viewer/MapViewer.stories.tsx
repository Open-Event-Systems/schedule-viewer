import { Meta, StoryObj } from "@storybook/react"
import { MapViewer } from "./MapViewer.js"
import "./MapViewer.scss"
import "./Map.scss"
import svgMap from "../../../../map/ao-map-2-relabel2.svg"
import { useRef, useState } from "react"
import { MapConfig } from "../types.js"

const meta: Meta<typeof MapViewer> = {
  component: MapViewer,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryObj<typeof MapViewer> = {
  args: {
    w: "100vw",
    h: "100vh",
  },
  render(args) {
    const [level, setLevel] = useState<string | null>(null)
    const [highlight, setHighlight] = useState<string | null>(null)
    const [selection, setSelection] = useState<string | null>(null)
    const zoomFuncRef = useRef<((id: string) => void) | null>(null)
    const [config] = useState<MapConfig>(() => ({
      src: svgMap,
      layers: [{ id: "background", title: "Background" }],
      levels: [
        { id: "3f", title: "3F" },
        { id: "2f", title: "2F" },
        { id: "lobby", title: "Lobby" },
        { id: "lower", title: "Lower Level" },
      ],
      locations: [
        {
          id: "registration",
          title: "Registration",
        },
        {
          id: "hospitality",
          title: "Hospitality",
        },
        {
          id: "video-games",
          title: "Video Games",
        },
        {
          id: "board-games",
          title: "Board Games",
        },
        {
          id: "stage",
          title: "Stage",
        },
        {
          id: "panel-1",
          title: "Panel Room One",
          description: "Lower level, next to Dealers' Den.",
        },
        {
          id: "panel-2",
          title: "Panel Room Two",
        },
        {
          id: "vendor-1",
          title: "Table 1",
        },
        {
          id: "vendor-21",
          title: "Table 21",
        },
      ],
      vendors: [
        {
          name: "Test Vendor",
          location: "vendor-1",
          description: "Test Vendor",
        },
        {
          name: "Test Vendor",
          location: "vendor-21",
          description: "Test Vendor",
        },
      ],
      flags: [],
      defaultLevel: "lobby",
    }))

    const now = new Date()

    return (
      <MapViewer
        {...args}
        config={config}
        level={level}
        onSetLevel={(level) => setLevel(level)}
        highlightId={highlight}
        selectionId={selection}
        zoomFuncRef={zoomFuncRef}
        onSelectLocation={(id) => {
          setHighlight(id)
          setSelection(id)
          id && zoomFuncRef.current && zoomFuncRef.current(id)
        }}
        events={[
          {
            id: "event-1",
            title: "Test Event 1",
            location: "panel-1",
            start: new Date(now.getTime() - 300000),
            end: new Date(now.getTime() + 3600000),
          },
          {
            id: "event-2",
            title: "Test Event 2",
            location: "panel-1",
            start: new Date(now.getTime() + 3600000),
            end: new Date(now.getTime() + 7200000),
          },
        ]}
      />
    )
  },
}
