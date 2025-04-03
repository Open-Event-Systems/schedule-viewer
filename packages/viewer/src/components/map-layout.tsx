import { Box } from "@mantine/core"
import { Outlet } from "@tanstack/react-router"

export const MapLayout = () => {
  return (
    <Box className="MapLayout-root">
      <Outlet />
    </Box>
  )
}
