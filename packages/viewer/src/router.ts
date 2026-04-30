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
  sharedPagesRoute,
  syncRoute,
  vendorDetailsRoute,
} from "./routes.js"
import type { AppContextValue } from "./types.js"

export type RouterContext = AppContextValue &
  Readonly<{
    contextPromise: Promise<AppContextValue>
    contextReady: boolean
    defaultPageCanonicalHref?: string
    pageTitle?: string
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
    const { config, historyType } = context
    const defaultPage = config.pages[0]
    let defaultPageCanonicalHref

    if (defaultPage && historyType == "browser") {
      defaultPageCanonicalHref =
        origin +
        router.buildLocation({
          to: pagesRoute.to,
          params: {
            pageId: defaultPage.id,
          },
        }).href
    }

    router.update({
      context: {
        ...partialContext,
        ...context,
        contextReady: true,
        ...(defaultPageCanonicalHref ? { defaultPageCanonicalHref } : {}),
      },
    })
    return context
  })

  const partialContext = {
    ...initialContext,
    origin,
    contextPromise: wrappedPromise,
    contextReady: false,
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
          filterStateRoute.addChildren([
            pagesRoute,
            sharedPagesRoute,
            eventDetailsRoute,
            vendorDetailsRoute,
          ]),
        ]),
      ]),
      syncRoute,
      mapProvidersRoute.addChildren([mapRoute]),
    ]),
    stringifySearch: (search) => {
      const params = new URLSearchParams()
      for (const key of Object.keys(search)) {
        const val = search[key]
        if (val == null) {
          continue
        } else if (Array.isArray(val)) {
          for (const arrVal of val) {
            params.append(key, arrVal)
          }
        } else if (typeof val == "object") {
          params.set(key, JSON.stringify(val))
        } else {
          params.set(key, val)
        }
      }

      return params.size > 0 ? `?${params}` : ""
    },
  })

  return router
}
