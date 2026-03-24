import { Outlet } from "@tanstack/react-router"
import { MainLayout } from "../components/layout/main-layout.js"
import { useViewerConfig } from "../config.js"
import { Text, Title } from "@mantine/core"

export const MainLayoutRoute = () => {
  const { homeURL } = useViewerConfig()
  return (
    <MainLayout homeURL={homeURL}>
      <Outlet />
    </MainLayout>
  )
}

export const MainLayoutNotFound = () => {
  const { homeURL } = useViewerConfig()
  return (
    <MainLayout homeURL={homeURL}>
      <NotFound />
    </MainLayout>
  )
}

export const NotFound = () => {
  return (
    <>
      <Title order={2}>Not Found</Title>
      <Text>The page was not found.</Text>
    </>
  )
}
export const MainLayoutError = () => {
  const { homeURL } = useViewerConfig()
  return (
    <MainLayout homeURL={homeURL}>
      <Title order={2}>Error</Title>
      <Text>An unexpected error occurred on the page.</Text>
    </MainLayout>
  )
}
