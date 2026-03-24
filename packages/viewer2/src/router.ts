import { createRouter, type RouterHistory } from "@tanstack/react-router"
import {
  eventDetailsRoute,
  filterStateRoute,
  mapProvidersRoute,
  mapRoute,
  pagesRoute,
  rootRoute,
  scheduleLayoutRoute,
  scheduleProvidersRoute,
} from "./routes.js"
import type { AppContextValue } from "./types.js"

export type RouterContext = AppContextValue &
  Readonly<{
    contextPromise: Promise<AppContextValue>
  }>

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: ReturnType<typeof makeRouter>
  }
}

export const makeRouter = (
  contextPromise: Promise<AppContextValue>,
  origin: string,
  basePath: string,
  history: RouterHistory,
  initialContext?: Partial<AppContextValue>,
) => {
  const wrappedPromise = contextPromise.then((context) => {
    router.update({
      context: {
        ...partialContext,
        ...context,
      },
    })
    return context
  })

  const partialContext = {
    ...initialContext,
    origin,
    contextPromise: wrappedPromise,
  } satisfies Partial<RouterContext>

  const router = createRouter({
    context: partialContext as RouterContext,
    origin,
    basepath: basePath,
    scrollRestoration: true,
    history,
    routeTree: rootRoute.addChildren([
      scheduleProvidersRoute.addChildren([
        scheduleLayoutRoute.addChildren([
          filterStateRoute.addChildren([pagesRoute, eventDetailsRoute]),
        ]),
      ]),
      mapProvidersRoute.addChildren([mapRoute]),
    ]),
  })

  return router
}
