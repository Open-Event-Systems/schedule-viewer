import { Container, Stack, Title } from "@mantine/core"
import { Outlet } from "@tanstack/react-router"
import { eventsDataRoute } from "../routes/index.js"

export const Layout = () => {
  const { config } = eventsDataRoute.useRouteContext()
  return (
    <Container className="Layout-root" size="md" p="xs">
      <Stack>
        <Title className="Layout-title" order={1}>
          {config.title || "Schedule"}
        </Title>
        <Outlet />
      </Stack>
    </Container>
  )
}
