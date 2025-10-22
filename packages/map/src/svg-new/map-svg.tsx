import { useProps } from "@mantine/core"
import clsx from "clsx"
import { ComponentPropsWithoutRef } from "react"
import { SVGData } from "./svg.js"

export type MapSVGProps = {
  svgData?: SVGData
} & Omit<ComponentPropsWithoutRef<"svg">, "children">

export const MapSVG = (props: MapSVGProps) => {
  const { className, svgData, ...other } = useProps("MapSVG", {}, props)

  return (
    <svg
      {...svgData?.props}
      className={clsx("MapSVG-root", svgData?.props.className, className)}
      {...other}
      dangerouslySetInnerHTML={{ __html: svgData?.innerHTML ?? "" }}
    />
  )
}
