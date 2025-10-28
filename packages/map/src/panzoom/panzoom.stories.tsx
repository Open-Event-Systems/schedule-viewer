import type { Meta, StoryObj } from "@storybook/react-webpack5"
import { PanZoom, ZoomFunc } from "./panzoom.js"
import { useEffect, useRef, useState } from "react"
import { parseSVGData, SVGData } from "../svg-new/svg.js"
import lobbyMap from "../../../viewer/public/example-map-lobby.svg"
import { Map } from "../map/map.js"

import "./panzoom.scss"

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
        mapWidth={960}
        mapHeight={960}
        bd="#000 solid 1px"
        zoomFuncRef={zoomFuncRef}
        {...args}
      >
        <Map>
          <Map.Level
            svgData={lobbyData}
            svgProps={{
              onClick: (e) => {
                zoomFuncRef.current &&
                  zoomFuncRef.current(e.target as SVGElement)
              },
            }}
          />
        </Map>
      </PanZoom>
    )
  },
}
