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

export type MapDetailsProps = {
  title?: ReactNode
  description?: string
  nowChildren?: ReactNode
  laterChildren?: ReactNode
} & BoxProps

export const MapDetails = (props: MapDetailsProps) => {
  const {
    className,
    title,
    description,
    nowChildren,
    laterChildren,
    ...other
  } = props

  const defaultValue = nowChildren ? "now" : "later"

  return (
    <Box className={clsx("MapDetails-root", className)} {...other}>
      {title && (
        <Title className="MapDetails-title" order={4} component="h2">
          {title}
        </Title>
      )}
      {description && (
        <Markdown className="MapDetails-description">{description}</Markdown>
      )}
      {laterChildren || (nowChildren && laterChildren) ? (
        <Accordion
          className="MapDetails-accordion"
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
        <Box className="MapDetails-now">{nowChildren}</Box>
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
      className={clsx("MapDetails-drawer", className)}
      classNames={{
        content: "MapDetails-drawerContent",
        body: "MapDetails-drawerBody",
      }}
      position={isLS ? "right" : "bottom"}
      withCloseButton={false}
      padding={0}
      {...other}
    />
  )
}

MapDetails.Drawer = MapDetailsDrawer
