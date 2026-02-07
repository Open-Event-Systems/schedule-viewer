import {
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router"
import type { SetupResult } from "./app.js"
import type { QueryClient } from "@tanstack/react-query"
import {
  eventDetailsRoute,
  filterStateRoute,
  mainLayoutRoute,
  pagesRoute,
  rootRoute,
  setupRoute,
} from "./routes.js"

export type RouterContext = {
  setupPromise: Promise<SetupResult>
  queryClient: QueryClient
}

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: ReturnType<typeof makeRouter>
  }
}
export const makeRouter = (
  context: RouterContext,
  history: "browser" | "hash" = "browser",
) => {
  let historyObj

  if (history == "browser") {
    historyObj = createBrowserHistory({})
  } else {
    historyObj = createHashHistory({})
  }

  return createRouter({
    context,
    scrollRestoration: true,
    history: historyObj,
    routeTree: rootRoute.addChildren([
      setupRoute.addChildren([
        mainLayoutRoute.addChildren([
          filterStateRoute.addChildren([pagesRoute, eventDetailsRoute]),
        ]),
      ]),
    ]),
  })
}
