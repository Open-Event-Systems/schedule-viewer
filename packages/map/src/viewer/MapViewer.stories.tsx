import { Meta, StoryObj } from "@storybook/react"
import { MapViewer } from "./MapViewer.js"
import "./MapViewer.scss"
import "./Map.scss"
import svgMap from "../../../../map/ao-map-2.svg"
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
      ],
      defaultLevel: "lobby",
    }))

    // useEffect(() => {
    //   return () => {
    //     control.dispose()
    //   }
    // }, [control])

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
      />
    )
  },
}
