import type { Meta, StoryObj } from "@storybook/react-vite"
import { PanZoom, type ZoomFunc } from "./panzoom.js"
import { useEffect, useRef, useState } from "react"
import { parseSVGData, type SVGData } from "../svg/svg.js"

import lobbyMap from "../../../viewer/public/example-map-lobby.svg"
import { MapSVG } from "../svg/map-svg.js"

const meta: Meta<typeof PanZoom> = {
  component: PanZoom,
}

export default meta

export const Default: StoryObj<typeof PanZoom> = {
  args: {
    w: 500,
    h: 500,
  },
  render(args) {
    const [lobbyData, setLobbyData] = useState<SVGData | undefined>()

    useEffect(() => {
      fetch(lobbyMap)
        .then((res) => {
          return res.text()
        })
        .then((txt) => {
          setLobbyData(parseSVGData(txt))
        })
    }, [])

    const zoomFuncRef = useRef<ZoomFunc>(null)

    return (
      <PanZoom
        bd="#000 solid 1px"
        zoomFuncRef={zoomFuncRef}
        contentWidth={960}
        contentHeight={960}
        {...args}
      >
        {lobbyData && <MapSVG svgData={lobbyData} />}
      </PanZoom>
    )
  },
}
