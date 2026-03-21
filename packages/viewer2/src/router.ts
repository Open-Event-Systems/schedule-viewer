import { createRouter, type RouterHistory } from "@tanstack/react-router"
import {
  eventDetailsRoute,
  filterStateRoute,
  mapRoute,
  pagesRoute,
  rootRoute,
  scheduleLayoutRoute,
} from "./routes.js"
import type { AppContextValue } from "./types.js"

export type RouterContext = AppContextValue

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: ReturnType<typeof makeRouter>
  }
}

export const makeRouter = (
  appContext: AppContextValue,
  origin: string,
  history: RouterHistory,
) => {
  return createRouter({
    context: {
      ...appContext,
    },
    origin,
    basepath:
      appContext.jsConfig.router == "browser"
        ? appContext.jsConfig.basePath
        : undefined,
    scrollRestoration: true,
    history,
    routeTree: rootRoute.addChildren([
      scheduleLayoutRoute.addChildren([
        filterStateRoute.addChildren([pagesRoute, eventDetailsRoute]),
      ]),
      mapRoute,
    ]),
  })
}
