import { Meta, StoryObj } from "@storybook/react"
import { MapSVG } from "./map-svg.js"
import { useEffect, useState } from "react"
import svgMap from "../../../../map/ao-map-2-relabel2.svg"

const meta: Meta<typeof MapSVG> = {}

export default meta

export const Default: StoryObj<typeof MapSVG> = {
  args: {
    level: "lobby",
  },
  render(args) {
    const [dataFunc, setDataFunc] = useState<(() => string) | null>(null)
    const [highlight, setHighlight] = useState<string | null>(null)

    useEffect(() => {
      fetch(svgMap)
        .then((resp) => resp.text())
        .then((svgData) => {
          setDataFunc(() => () => svgData)
        })
    }, [])

    if (dataFunc) {
      return (
        <MapSVG
          {...args}
          getSVGData={dataFunc}
          onSelectLocation={(id) => {
            setHighlight(id)
          }}
          highlightId={highlight}
        />
      )
    } else {
      return <>Loading</>
    }
  },
}
