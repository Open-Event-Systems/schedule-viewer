import { Container } from "@mantine/core"
import { Outlet } from "@tanstack/react-router"

export const Layout = () => {
  return (
    <Container size="md" p="xs">
      <Outlet />
    </Container>
  )
}
