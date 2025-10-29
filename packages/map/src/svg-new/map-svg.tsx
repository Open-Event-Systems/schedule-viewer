import { useProps } from "@mantine/core"
import clsx from "clsx"
import { type ComponentPropsWithoutRef, forwardRef } from "react"
import type { SVGData } from "./svg.js"

export type MapSVGProps = {
  svgData?: SVGData
} & Omit<ComponentPropsWithoutRef<"svg">, "children">

export const MapSVG = forwardRef<SVGSVGElement, MapSVGProps>((props, ref) => {
  const { className, svgData, ...other } = useProps("MapSVG", {}, props)

  return (
    <svg
      ref={ref}
      {...svgData?.props}
      className={clsx("MapSVG-root", svgData?.props.className, className)}
      {...other}
      dangerouslySetInnerHTML={{ __html: svgData?.innerHTML ?? "" }}
    />
  )
})
