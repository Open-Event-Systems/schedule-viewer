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
  getCurrentURL: () => string
}

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: ReturnType<typeof makeRouter>
  }
}

export const makeRouter = (
  setupPromise: Promise<SetupResult>,
  origin: string,
  history: "browser" | "hash" = "hash",
  basePath = "",
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
      getCurrentURL: () => window.location.href,
      setupPromise,
    },
    origin,
    basepath: history == "browser" ? basePath : undefined,
    scrollRestoration: true,
    history: historyObj,
    routeTree: rootRoute.addChildren([
      scheduleSetupRoute.addChildren([
        scheduleLayoutRoute.addChildren([
          filterStateRoute.addChildren([pagesRoute, eventDetailsRoute]),
        ]),
      ]),
      mapSetupRoute.addChildren([mapRoute]),
    ]),
  })
}
