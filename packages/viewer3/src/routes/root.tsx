import {
  createRootRouteWithContext,
  createRoute,
  Outlet,
  useRouteContext,
} from "@tanstack/react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { LoadingRoute } from "./components/loading/loading.js"
import { schedulePageRoute } from "./schedule-page.js"
import type { RouterContext } from "../router.js"

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => {
    const { queryClient } = useRouteContext({ from: "__root__" })

    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
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

export default rootRoute.addChildren([schedulePageRoute])