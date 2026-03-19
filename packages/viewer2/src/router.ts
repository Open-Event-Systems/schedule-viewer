import {
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router"
import {
  eventDetailsRoute,
  filterStateRoute,
  mapRoute,
  mapSetupRoute,
  pagesRoute,
  rootRoute,
  scheduleLayoutRoute,
  scheduleSetupRoute,
} from "./routes.js"
import type { SetupResult } from "./setup.js"

export type RouterContext = {
  setupPromise: Promise<SetupResult>
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
      scheduleLayoutRoute.addChildren([
        scheduleSetupRoute.addChildren([
          filterStateRoute.addChildren([pagesRoute, eventDetailsRoute]),
        ]),
      ]),
      mapSetupRoute.addChildren([mapRoute]),
    ]),
  })
}
