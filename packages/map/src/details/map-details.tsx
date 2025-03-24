import {
  Box,
  BoxProps,
  Drawer,
  DrawerProps,
  Stack,
  Text,
  Title,
  useProps,
} from "@mantine/core"
import clsx from "clsx"
import { MapLocation } from "../types.js"

export type MapDetailsProps = BoxProps & {
  title?: string
  description?: string
}

export const MapDetails = (props: MapDetailsProps) => {
  const { className, title, description, ...other } = useProps(
    "MapDetails",
    {},
    props,
  )

  return (
    <Box className={clsx("MapDetails-root", className)} {...other}>
      <Stack>
        {title && <Title order={4}>{title}</Title>}
        {description && <Text>{description}</Text>}
      </Stack>
    </Box>
  )
}

export type MapDetailsDrawerProps = DrawerProps & {
  title?: string
  description?: string
}

const MapDetailsDrawer = (props: MapDetailsDrawerProps) => {
  const { className, title, description, ...other } = useProps(
    "MapDetailsDrawer",
    {},
    props,
  )

  return (
    <Drawer
      className={clsx("MapDetailsDrawer-root", className)}
      position="bottom"
      title={title}
      withOverlay={false}
      size="33%"
      {...other}
    >
      <MapDetails description={description} />
    </Drawer>
  )
}

MapDetails.Drawer = MapDetailsDrawer
