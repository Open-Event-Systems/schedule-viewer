import { useLocation } from "@tanstack/react-router"
import { MainLayout } from "../components/layout/main-layout.js"
import { ConfirmSyncPage } from "../components/sync/confirm-sync.js"
import { PageTitle } from "../components/title/title.js"
import { rootRoute } from "../routes.js"
import { ViewerConfigContext } from "../config.js"

const SyncRoute = () => {
  const config = rootRoute.useRouteContext({
    select: (ctx) => ctx.config,
  })

  const sessionToken = useLocation({
    select: (loc) => {
      const urlParams = new URLSearchParams(loc.hash)
      return urlParams.get("sync")
    },
  })

  return (
    <ViewerConfigContext value={config}>
      <MainLayout>
        <MainLayout.Header>
          <MainLayout.Title homeURL={config.homeURL}>
            <PageTitle />
          </MainLayout.Title>
        </MainLayout.Header>
        <MainLayout.Content>
          <ConfirmSyncPage sessionToken={sessionToken} />
        </MainLayout.Content>
        <MainLayout.Footer />
      </MainLayout>
    </ViewerConfigContext>
  )
}

export default SyncRoute
