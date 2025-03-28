import { Container, Stack, Text, Title } from "@mantine/core"
import { useLayoutEffect } from "react"

export const NotFoundRoute = () => {
  useLayoutEffect(() => {
    const el = document.createElement("meta")
    el.setAttribute("name", "robots")
    el.setAttribute("content", "noindex")
    document.head.appendChild(el)
    return () => {
      document.head.removeChild(el)
    }
  }, [])

  return (
    <Container className="ScheduleLayout-root" size="md" p="xs">
      <Stack>
        <Title className="ScheduleLayout-title" order={1}>
          Not Found
        </Title>
        <Text component="p">The page was not found.</Text>
      </Stack>
    </Container>
  )
}
