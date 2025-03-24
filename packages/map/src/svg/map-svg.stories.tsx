import { Meta, StoryObj } from "@storybook/react"
import { getMapSVGProps, MapSVG } from "./map-svg.js"
import { useEffect, useMemo, useState } from "react"
import svgMap from "../../../../map/ao-map-2.svg"

const meta: Meta<typeof MapSVG> = {
  component: MapSVG,
}

export default meta

export const Default: StoryObj<typeof MapSVG> = {
  args: {
    level: "lobby",
  },
  render(args) {
    const [data, setData] = useState<string | null>(null)
    const [highlight, setHighlight] = useState<string | null>(null)

    const [svgProps, innerHTML] = useMemo(() => {
      if (data) {
        return getMapSVGProps(data)
      } else {
        return [null, ""]
      }
    }, [data])

    useEffect(() => {
      fetch(svgMap)
        .then((resp) => resp.text())
        .then((svgData) => {
          setData(svgData)
        })
    }, [])

    if (svgProps) {
      return (
        <MapSVG
          {...args}
          {...svgProps}
          onSelectLocation={(id) => {
            setHighlight(id)
          }}
          highlightId={highlight}
          dangerouslySetInnerHTML={{ __html: innerHTML }}
        />
      )
    } else {
      return <>Loading</>
    }
  },
}
