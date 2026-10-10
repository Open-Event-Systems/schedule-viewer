import { useAppContext } from "#src/app.js"
import { MainLayout } from "#src/components/main-layout/main-layout.js"
import { Outlet } from "@tanstack/react-router"

export const MainLayoutRoute = () => {
  const { config } = useAppContext()
  // TODO: title
  return (
    <MainLayout
      title={config.name}
      homeURL={config.homeURL}
      logoURL={config.logoURL}
    >
      <Outlet />
    </MainLayout>
  )
}
