import { Box, Title } from "@mantine/core"
import { Outlet } from "@tanstack/react-router"

import classes from "./main-layout.module.scss"
import clsx from "clsx"
import { useViewerConfig } from "../config.js"
import { Markdown } from "@open-event-systems/schedule-react"

export const MainLayout = () => {
  const config = useViewerConfig()
  return (
    <Box className={clsx("MainLayout-root", classes.root)}>
      <Box className={clsx("MainLayout-container", classes.container)}>
        <Title className={clsx("MainLayout-title", classes.title)} order={1}>
          {config.title}
        </Title>
        <Markdown
          className={clsx("MainLayout-description", classes.description)}
        >
          {config.description}
        </Markdown>
        <Outlet />
      </Box>
    </Box>
  )
}
