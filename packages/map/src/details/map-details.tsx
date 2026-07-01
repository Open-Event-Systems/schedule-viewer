import {
  Accordion,
  Box,
  Drawer,
  Title,
  useProps,
  type BoxProps,
  type DrawerProps,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { Markdown } from "@open-event-systems/schedule-react"
import clsx from "clsx"
import { type ReactNode } from "react"

import classes from "./map-details.module.scss"

export type MapDetailsProps = {
  name?: ReactNode
  description?: string
  nowChildren?: ReactNode
  laterChildren?: ReactNode
} & BoxProps

export const MapDetails = (props: MapDetailsProps) => {
  const { className, name, description, nowChildren, laterChildren, ...other } =
    props

  const defaultValue = nowChildren ? "now" : "later"

  return (
    <Box
      className={clsx("MapDetails-root", classes.root, className)}
      {...other}
    >
      {name && (
        <Title
          className={clsx("MapDetails-title", classes.title)}
          order={4}
          component="h2"
        >
          {name}
        </Title>
      )}
      {description && (
        <Markdown
          className={clsx("MapDetails-description", classes.description)}
        >
          {description}
        </Markdown>
      )}
      {laterChildren || (nowChildren && laterChildren) ? (
        <Accordion
          className={clsx("MapDetails-accordion", classes.accordion)}
          defaultValue={defaultValue}
          chevronPosition="left"
          {...other}
        >
          {nowChildren && (
            <Accordion.Item key="now" value="now">
              <Accordion.Control>Now</Accordion.Control>
              <Accordion.Panel>{nowChildren}</Accordion.Panel>
            </Accordion.Item>
          )}
          {laterChildren && (
            <Accordion.Item key="later" value="later">
              <Accordion.Control>Later</Accordion.Control>
              <Accordion.Panel>{laterChildren}</Accordion.Panel>
            </Accordion.Item>
          )}
        </Accordion>
      ) : (
        <Box className={clsx("MapDetails-now", classes.now)}>{nowChildren}</Box>
      )}
    </Box>
  )
}

export type MapDetailsDrawerProps = DrawerProps

const MapDetailsDrawer = (props: MapDetailsDrawerProps) => {
  const { className, ...other } = useProps("MapDetailsDrawer", {}, props)
  const isLS = useMediaQuery("(orientation: landscape)")

  return (
    <Drawer
      className={clsx("MapDetails-drawer", classes.drawer, className)}
      classNames={{
        content: clsx("MapDetails-drawerContent", classes.drawerContent),
        body: clsx("MapDetails-drawerBody", classes.drawerBody),
      }}
      position={isLS ? "right" : "bottom"}
      withCloseButton={false}
      padding={0}
      {...other}
    />
  )
}

MapDetails.Drawer = MapDetailsDrawer
