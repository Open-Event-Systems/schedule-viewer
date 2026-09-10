import { MantineProvider } from "@mantine/core"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRouter as tsCreateRouter } from "@tanstack/react-router"
import type { JSX, ReactNode } from "react"
import {
  AppContext,
  awaitAppContext,
  type AppContextValue,
  type AwaitedAppContextValue,
} from "../hooks/app.js"
import { parseSearch, stringifySearch } from "../search-params.js"
import routeTree from "./routes/root.js"

export type RouterContext = AppContextValue & {
  readonly appContextPromise: Promise<AwaitedAppContextValue>
  readonly scripts?: Iterable<JSX.IntrinsicElements["script"]>
  readonly links?: Iterable<JSX.IntrinsicElements["link"]>
}

export const createRouter = (
  appContext: AppContextValue,
  opts?: {
    scripts?: Iterable<JSX.IntrinsicElements["script"]>
    links?: Iterable<JSX.IntrinsicElements["link"]>
  },
) => {
  const { basePath, theme } = appContext
  const { scripts, links } = opts ?? {}
  const queryClient = appContext.queryClient

  const appContextPromise = awaitAppContext(appContext)

  const router = tsCreateRouter({
    basepath: basePath,
    context: {
      ...appContext,
      appContextPromise,
      scripts,
      links,
    },
    routeTree,
    scrollRestoration: true,
    parseSearch,
    stringifySearch,
    Wrap: ({ children }: { children: ReactNode }) => {
      return (
        <AppContext.Provider value={appContextPromise}>
          <MantineProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
              {children}
              <ReactQueryDevtools client={queryClient} />
            </QueryClientProvider>
          </MantineProvider>
        </AppContext.Provider>
      )
    },
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
