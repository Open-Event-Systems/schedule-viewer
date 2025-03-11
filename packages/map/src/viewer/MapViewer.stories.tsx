import { Meta, StoryObj } from "@storybook/react"
import { MapViewer } from "./MapViewer.js"
import "./MapViewer.scss"
import "./Map.scss"
import svgMap from "../../../../map/ao-map.svg"
import { useEffect, useState } from "react"
import { MapControl } from "../control.js"

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
    const [control] = useState(
      () =>
        new MapControl({
          src: svgMap,
          levels: [
            { id: "lobby", title: "Lobby" },
            { id: "lower", title: "Lower Level" },
          ],
          defaultLevel: "lobby",
          layers: [{ id: "background", title: "Background" }],
        }),
    )

    useEffect(() => {
      control.ready.then((control) => {})
    }, [control])

    return <MapViewer {...args} control={control} />
  },
}
