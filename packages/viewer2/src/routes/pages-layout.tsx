import { Box, Title } from "@mantine/core"
import { Outlet } from "@tanstack/react-router"
import { useViewerConfig } from "../config.js"
import { Markdown } from "@open-event-systems/schedule-react"

export const PagesLayoutRoute = () => {
  const config = useViewerConfig()
  return (
    <Box>
      <Title>{config.title}</Title>
      <Markdown>{config.description}</Markdown>
      <Outlet />
    </Box>
  )
}
