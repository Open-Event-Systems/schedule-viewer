import {
  createRootRouteWithContext,
  createRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import type { RouterContext } from "../router.js"
import { LoadingRoute } from "./components/loading/loading.js"
import schedulePageRoutes from "./schedule-page.js"
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <>
        <HeadContent />
        <Outlet />
        <Scripts />
      </>
    )
  },
})

export const contextRoute = createRoute({
  id: "loading",
  getParentRoute: () => rootRoute,
  beforeLoad: async ({ context: { appContextPromise } }) => {
    await appContextPromise
  },
  pendingComponent: LoadingRoute,
  pendingMs: 0,
  pendingMinMs: 200,
})

export default rootRoute.addChildren([
  contextRoute.addChildren([schedulePageRoutes]),
])
