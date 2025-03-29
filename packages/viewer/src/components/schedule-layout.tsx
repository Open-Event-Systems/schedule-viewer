import { Box, Container, Stack, Title } from "@mantine/core"
import { Outlet } from "@tanstack/react-router"
import { eventsDataRoute } from "../routes/index.js"
import { UpdateButton } from "./update-button.js"
import { Markdown } from "@open-event-systems/schedule-components/markdown/Markdown"

export const ScheduleLayout = () => {
  const { config } = eventsDataRoute.useRouteContext()
  return (
    <Container className="ScheduleLayout-root" size="md" p="xs">
      <Stack>
        <Title className="ScheduleLayout-title" order={1}>
          {config.title || "Schedule"}
        </Title>
        <Markdown>{config.description}</Markdown>
        <Box mih="2rem">
          <UpdateButton />
        </Box>
        <Outlet />
      </Stack>
    </Container>
  )
}
