import { Outlet } from "@tanstack/react-router"
import { MainLayout } from "../components/layout/main-layout.js"

export const MainLayoutRoute = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
