import { Outlet } from "@tanstack/react-router"
import { MainLayout } from "../components/layout/main-layout.js"
import { useViewerConfig } from "../config.js"
import { Text } from "@mantine/core"
import { PageTitle } from "../components/title/title.js"

export const MainLayoutRoute = () => {
  const { homeURL } = useViewerConfig()
  return (
    <MainLayout homeURL={homeURL} title={<PageTitle />}>
      <Outlet />
    </MainLayout>
  )
}

export const MainLayoutNotFound = () => {
  const { homeURL } = useViewerConfig()
  return (
    <MainLayout homeURL={homeURL} title="Not Found">
      <NotFound />
    </MainLayout>
  )
}

export const NotFound = () => {
  return (
    <>
      <Text>The page was not found.</Text>
    </>
  )
}
export const MainLayoutError = () => {
  const { homeURL } = useViewerConfig()
  return (
    <MainLayout homeURL={homeURL} title="Error">
      <Text>An unexpected error occurred on the page.</Text>
    </MainLayout>
  )
}
