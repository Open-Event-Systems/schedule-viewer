import { Box, BoxProps, useProps } from "@mantine/core"
import clsx from "clsx"
import { MapSVG } from "../svg-new/map-svg.js"
import { ComponentPropsWithoutRef, ReactNode } from "react"
import { SVGData } from "../svg-new/svg.js"

export type MapProps = {
  children?: ReactNode
} & BoxProps

export const Map = (props: MapProps) => {
  const { className, ...other } = useProps("Map", {}, props)

  return <Box className={clsx("Map-root", className)} {...other} />
}

export type MapItemProps = {
  svgData?: SVGData
  svgProps?: Partial<ComponentPropsWithoutRef<"svg">>
} & Omit<BoxProps, "children">

const Item = (props: MapItemProps) => {
  const { className, svgData, svgProps, ...other } = useProps(
    "MapItem",
    {},
    props,
  )

  return (
    <Box className={clsx("Map-item", className)} {...other}>
      <MapSVG
        svgData={svgData}
        {...svgProps}
        className={clsx("Map-itemSVG", svgProps?.className)}
      />
    </Box>
  )
}

Map.Item = Item

export type MapLevelProps = {
  levelId?: string
} & MapItemProps

const Level = (props: MapLevelProps) => {
  const { className, levelId, ...other } = useProps("MapLevel", {}, props)

  const idCls = `Map-level-id-${levelId}`

  return (
    <Map.Item
      className={clsx("Map-level", className, { [idCls]: !!levelId })}
      {...other}
    />
  )
}

Map.Level = Level
