import {
  Anchor,
  Box,
  BoxProps,
  Drawer,
  DrawerProps,
  Grid,
  Stack,
  Text,
  Title,
  useProps,
} from "@mantine/core"
import clsx from "clsx"
import { MapEvent } from "../types.js"
import { MouseEvent } from "react"

export type MapDetailsProps = BoxProps & {
  title?: string
  description?: string
  type?: "location" | "vendor"
  currentEvent?: MapEvent
  futureEvent?: MapEvent
  onClickEvent?: (e: MouseEvent, event: MapEvent) => void
  getEventHref?: (event: MapEvent) => string | undefined
}

export const MapDetails = (props: MapDetailsProps) => {
  const {
    className,
    title,
    description,
    type = "location",
    currentEvent,
    futureEvent,
    onClickEvent,
    getEventHref,
    ...other
  } = useProps("MapDetails", {}, props)

  return (
    <Box className={clsx("MapDetails-root", className)} {...other}>
      <Stack>
        {title && <Title order={4}>{title}</Title>}
        {description && <Text size="sm">{description}</Text>}
        {type == "location" && (
          <MapDetailsEvent
            currentEvent={currentEvent}
            futureEvent={futureEvent}
            onClickEvent={onClickEvent}
            getEventHref={getEventHref}
          />
        )}
      </Stack>
    </Box>
  )
}

const MapDetailsEvent = ({
  currentEvent,
  futureEvent,
  onClickEvent,
  getEventHref,
}: {
  currentEvent?: MapEvent
  futureEvent?: MapEvent
  onClickEvent?: (e: MouseEvent, event: MapEvent) => void
  getEventHref?: (event: MapEvent) => string | undefined
}) => {
  return (
    <Grid gutter="xs" align="baseline">
      {currentEvent && (
        <>
          <Grid.Col span={{ base: 2, xs: 2, sm: 1 }}>
            <Text size="sm">
              <strong>Now:</strong>
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 10, xs: 10, sm: 11 }}>
            <Anchor
              size="sm"
              href={getEventHref && getEventHref(currentEvent)}
              onClick={(e) => onClickEvent && onClickEvent(e, currentEvent)}
            >
              {currentEvent.title}
            </Anchor>
          </Grid.Col>
        </>
      )}
      {futureEvent && (
        <>
          <Grid.Col span={{ base: 2, xs: 2, sm: 1 }}>
            <Text size="sm">
              <strong>Later:</strong>
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 10, xs: 10, sm: 11 }}>
            <Anchor
              size="sm"
              href={getEventHref && getEventHref(futureEvent)}
              onClick={(e) => onClickEvent && onClickEvent(e, futureEvent)}
            >
              {futureEvent.title}
            </Anchor>
          </Grid.Col>
        </>
      )}
    </Grid>
  )
}

export type MapDetailsDrawerProps = DrawerProps & {
  title?: string
  description?: string
  type?: "location" | "vendor"
  currentEvent?: MapEvent
  futureEvent?: MapEvent
  onClickEvent?: (e: MouseEvent, event: MapEvent) => void
  getEventHref?: (event: MapEvent) => string | undefined
}

const MapDetailsDrawer = (props: MapDetailsDrawerProps) => {
  const {
    className,
    title,
    description,
    currentEvent,
    futureEvent,
    onClickEvent,
    getEventHref,
    ...other
  } = useProps("MapDetailsDrawer", {}, props)

  return (
    <Drawer
      className={clsx("MapDetailsDrawer-root", className)}
      position="bottom"
      title={title}
      withOverlay={false}
      size="40%"
      {...other}
    >
      <MapDetails
        description={description}
        currentEvent={currentEvent}
        futureEvent={futureEvent}
        onClickEvent={onClickEvent}
        getEventHref={getEventHref}
      />
    </Drawer>
  )
}

MapDetails.Drawer = MapDetailsDrawer
