import { ActionIcon, Group, GroupProps, useProps } from "@mantine/core"
import {
  IconHome,
  IconMinus,
  IconPlus,
  IconZoomScan,
} from "@tabler/icons-react"
import clsx from "clsx"

export type ZoomMenuProps = {
  homeURL?: string
  onZoom?: (type: "in" | "out" | "reset") => void
} & GroupProps

export const ZoomMenu = (props: ZoomMenuProps) => {
  const { className, homeURL, onZoom, ...other } = useProps(
    "ZoomMenu",
    {},
    props,
  )

  return (
    <Group className={clsx("ZoomMenu-root", className)} gap="xs" {...other}>
      {homeURL && (
        <ActionIcon
          component="a"
          title="Home"
          aria-label="home"
          radius="xl"
          variant="default"
          href={homeURL}
        >
          <IconHome />
        </ActionIcon>
      )}
      <ActionIcon
        title="Zoom In"
        aria-label="zoom in"
        radius="xl"
        variant="default"
        onClick={() => {
          onZoom && onZoom("in")
        }}
      >
        <IconPlus />
      </ActionIcon>
      <ActionIcon
        title="Zoom Out"
        aria-label="zoom out"
        radius="xl"
        variant="default"
        onClick={() => {
          onZoom && onZoom("out")
        }}
      >
        <IconMinus />
      </ActionIcon>
      <ActionIcon
        title="Reset Zoom"
        aria-label="reset zoom"
        radius="xl"
        variant="default"
        onClick={() => {
          onZoom && onZoom("reset")
        }}
      >
        <IconZoomScan />
      </ActionIcon>
    </Group>
  )
}
