import { Outlet } from "@tanstack/react-router"
import { useViewerConfig } from "../config.js"
import { Text } from "@mantine/core"
import { PageTitle } from "../components/title/title.js"
import { lazy, Suspense } from "react"
import { useRequiredContext } from "../utils.js"
import { SWStoreContext } from "../sw/service-worker.js"
import { useStore } from "zustand"
import { useShallow } from "zustand/react/shallow"
import { useMediaQuery } from "@mantine/hooks"
import { MainLayout } from "../components/layout/main-layout.js"
import { PWAStoreContext } from "../sw/pwa.js"
import { SWButtons } from "../components/sw/sw-buttons.js"

import classes from "./main-layout.module.scss"

const _MainLayoutRoute = () => {
  const { homeURL, logoURL } = useViewerConfig()

  return (
    <MainLayout>
      <MainLayout.Header icons={<MainLayoutRoute.SWMenu />}>
        <MainLayout.Title homeURL={homeURL} logoURL={logoURL}>
          <PageTitle />
        </MainLayout.Title>
      </MainLayout.Header>
      <MainLayout.Content>
        <Outlet />
      </MainLayout.Content>
      <MainLayout.Footer
        rightSection={<MainLayoutRouteVersion />}
      ></MainLayout.Footer>
      <Suspense>
        <LazyNotifications autoClose={8000} />
      </Suspense>
    </MainLayout>
  )
}

export const MainLayoutRouteNotFound = () => {
  const { homeURL } = useViewerConfig()
  return (
    <MainLayout>
      <MainLayout.Header icons={<MainLayoutRoute.SWMenu />}>
        <MainLayout.Title homeURL={homeURL}>Not Found</MainLayout.Title>
      </MainLayout.Header>
      <MainLayout.Content>
        <MainLayoutRoute.NotFoundMessage />
      </MainLayout.Content>
      <MainLayout.Footer
        rightSection={<MainLayoutRouteVersion />}
      ></MainLayout.Footer>
      <Suspense>
        <LazyNotifications autoClose={8000} />
      </Suspense>
    </MainLayout>
  )
}

export const MainLayoutRouteNotFoundMessage = () => {
  return (
    <>
      <Text>The page was not found.</Text>
    </>
  )
}

export const MainLayoutRouteError = () => {
  const { homeURL } = useViewerConfig()
  return (
    <MainLayout>
      <MainLayout.Header>
        <MainLayout.Title homeURL={homeURL}>Error</MainLayout.Title>
      </MainLayout.Header>
      <MainLayout.Content>
        <Text>An unexpected error has occurred on this page.</Text>
      </MainLayout.Content>
      <MainLayout.Footer
        rightSection={<MainLayoutRouteVersion />}
      ></MainLayout.Footer>
    </MainLayout>
  )
}

export const MainLayoutRouteSWMenu = () => {
  const pwaStore = useRequiredContext(PWAStoreContext)
  const swStore = useRequiredContext(SWStoreContext)

  const isSmall = useMediaQuery("(max-width: 768px)")

  const { swStatus, update } = useStore(
    swStore,
    useShallow(({ getStatus, update }) => {
      return {
        swStatus: getStatus(),
        update,
      }
    }),
  )

  const { pwaStatus, prompt } = useStore(
    pwaStore,
    useShallow(({ getStatus, prompt }) => {
      return {
        pwaStatus: getStatus(),
        prompt,
      }
    }),
  )

  return (
    <SWButtons
      swStatus={swStatus}
      pwaStatus={pwaStatus}
      onUpdate={update}
      onInstall={prompt}
      size={isSmall ? "md" : "lg"}
    />
  )
}

export const MainLayoutRouteVersion = () => {
  return <Text className={classes.version}>ULE {`v${__VIEWER_VERSION__}`}</Text>
}

const LazyNotifications = lazy(() =>
  import("@mantine/notifications").then(({ Notifications }) => ({
    default: Notifications,
  })),
)

export const MainLayoutRoute = Object.assign(_MainLayoutRoute, {
  NotFound: MainLayoutRouteNotFound,
  NotFoundMessage: MainLayoutRouteNotFoundMessage,
  Error: MainLayoutRouteError,
  SWMenu: MainLayoutRouteSWMenu,
  Version: MainLayoutRouteVersion,
})

export default MainLayoutRoute
