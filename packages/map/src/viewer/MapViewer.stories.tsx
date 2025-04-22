import { Meta, StoryObj } from "@storybook/react"
import { MapViewer } from "./MapViewer.js"
import "./MapViewer.scss"
import "./Map.scss"
import svgMap from "../../../viewer/public/example-map.svg"
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
      layers: [{ id: "text", title: "Text" }],
      levels: [
        { id: "2f", title: "2F" },
        { id: "lobby", title: "Lobby" },
      ],
      locations: [
        {
          id: "room-1",
          title: "Room 1",
          description: "Room 1, on the first floor.",
        },
        {
          id: "room-2",
          title: "Room 2",
          description: "Room 2, on the second floor.",
        },
        {
          id: "room-3",
          title: "Room 3",
          description: "Room 3, on the second floor.",
        },
      ],
      vendors: [],
      flags: [],
      defaultLevel: "lobby",
      minScale: 0.1,
      maxScale: 10,
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
