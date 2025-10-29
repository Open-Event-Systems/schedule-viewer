import type { Meta, StoryObj } from "@storybook/react-vite"
import { Map, type MapProps } from "./map.js"
import { type ComponentType, useEffect, useState } from "react"

import lobbyMap from "../../../viewer/public/example-map-lobby.svg"
import f2Map from "../../../viewer/public/example-map-2f.svg"

import "./styles.scss"
import clsx from "clsx"
import { parseSVGData, type SVGData } from "../svg-new/svg.js"

type MapStoryArgs = MapProps & {
  isometric?: boolean
}

const meta: Meta<ComponentType<MapStoryArgs>> = {
  component: Map,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    isometric: false,
  },
}

export default meta

export const Default: StoryObj<ComponentType<MapStoryArgs>> = {
  render(args) {
    const { isometric, ...props } = args
    const [lobbyData, setLobbyData] = useState<SVGData | undefined>()
    const [f2Data, setF2Data] = useState<SVGData | undefined>()

    useEffect(() => {
      fetch(lobbyMap)
        .then((res) => {
          return res.text()
        })
        .then((txt) => {
          setLobbyData(parseSVGData(txt))
        })
    }, [])

    useEffect(() => {
      fetch(f2Map)
        .then((res) => {
          return res.text()
        })
        .then((txt) => {
          setF2Data(parseSVGData(txt))
        })
    }, [])

    return (
      <Map
        {...props}
        className={clsx({ "Map-isometric-transform": isometric })}
      >
        <Map.Level levelId="lobby" svgData={lobbyData} />
        <Map.Level levelId="2f" svgData={f2Data} />
      </Map>
    )
  },
}
