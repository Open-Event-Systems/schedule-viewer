import { Outlet } from "@tanstack/react-router"
import { MainLayout } from "../components/layout/main-layout.js"
import { useViewerConfig } from "../config.js"

export const MainLayoutRoute = () => {
  const { homeURL } = useViewerConfig()
  return (
    <MainLayout homeURL={homeURL}>
      <Outlet />
    </MainLayout>
  )
}
