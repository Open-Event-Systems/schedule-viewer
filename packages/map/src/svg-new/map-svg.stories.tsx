import type { Meta, StoryObj } from "@storybook/react-vite"
import { MapSVG } from "./map-svg.js"

import svgMap from "../../../viewer/public/example-map-lobby.svg"
import { useEffect, useState } from "react"
import { parseSVGData, type SVGData } from "./svg.js"

const meta: Meta<typeof MapSVG> = {
  component: MapSVG,
}

export default meta

export const Default: StoryObj<typeof MapSVG> = {
  render(args) {
    const [data, setData] = useState<SVGData | undefined>(undefined)
    useEffect(() => {
      fetch(svgMap)
        .then((res) => {
          return res.text()
        })
        .then((txt) => {
          setData(parseSVGData(txt))
        })
    }, [])

    return <MapSVG {...args} svgData={data} />
  },
}
