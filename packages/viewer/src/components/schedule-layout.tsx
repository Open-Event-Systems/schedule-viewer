import { Anchor, Box, Container, Grid, Stack, Title } from "@mantine/core"
import { Outlet } from "@tanstack/react-router"
import { eventsDataRoute } from "../routes/index.js"
import { UpdateButton } from "./update-button.js"
import { Markdown } from "@open-event-systems/schedule-components/markdown/Markdown"
import { InstallButton } from "./install-button.js"

export const ScheduleLayout = () => {
  const { config } = eventsDataRoute.useRouteContext()
  return (
    <Container className="ScheduleLayout-root" size="md" p="xs">
      <Stack>
        <Grid gutter="xs">
          <Grid.Col span="auto">
            <Title className="ScheduleLayout-title" order={1}>
              {config.homeURL ? (
                <Anchor
                  href={config.homeURL}
                  className="ScheduleLayout-titleLink"
                >
                  {config.title || "Event Schedule"}
                </Anchor>
              ) : (
                config.title || "Event Schedule"
              )}
            </Title>
          </Grid.Col>
          <Grid.Col span="content">
            <InstallButton />
          </Grid.Col>
        </Grid>
        <Markdown>{config.description}</Markdown>
        <Box mih="2rem">
          <UpdateButton />
        </Box>
        <Outlet />
      </Stack>
    </Container>
  )
}
