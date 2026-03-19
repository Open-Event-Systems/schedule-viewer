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
import { type SetupResult } from "./setup.js"

export type RouterContext = {
  setupPromise: Promise<SetupResult>
  routerType: "browser" | "hash"
  origin: string
}

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: ReturnType<typeof makeRouter>
  }
}

export const makeRouter = (
  setupPromise: Promise<SetupResult>,
  history: "browser" | "hash" = "browser",
  origin?: string,
) => {
  let historyObj

  if (history == "browser") {
    historyObj = createBrowserHistory({})
  } else {
    historyObj = createHashHistory({})
  }

  return createRouter({
    context: {
      routerType: history,
      origin: origin ?? window.origin,
      setupPromise,
    },
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
