import { MantineProvider, type MantineThemeOverride } from "@mantine/core"
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRouter as tsCreateRouter,
  type RouterHistory,
} from "@tanstack/react-router"
import type { ReactNode } from "react"
import {
  awaitAppContext,
  type AppContextValue,
  type AwaitedAppContextValue,
} from "../hooks/app.js"
import { parseSearch, stringifySearch } from "../search-params.js"
import routeTree from "./routes/root.js"

export type RouterContext = Readonly<{
  queryClient: QueryClient
  appContext: AppContextValue
  appContextPromise: Promise<AwaitedAppContextValue>
}>

export type SetupFuncReturnValue = Readonly<{
  history: RouterHistory
  appContext: AppContextValue
  theme?: MantineThemeOverride
}>

export type SetupFunc = () => SetupFuncReturnValue

export type CreateRouterOptions = Readonly<{
  basepath?: string
}>

export const createRouter = (
  setupFunc: SetupFunc,
  options?: CreateRouterOptions,
) => {
  const { basepath } = options ?? {}

  const { history, appContext, theme } = setupFunc()

  const router = tsCreateRouter({
    basepath,
    history,
    context: {
      queryClient: appContext.queryClient,
      appContext,
      appContextPromise: awaitAppContext(appContext),
    },
    routeTree,
    scrollRestoration: true,
    parseSearch,
    stringifySearch,
    Wrap: ({ children }: { children: ReactNode }) => {
      return (
        <>
          <MantineProvider theme={theme}>
            <QueryClientProvider client={appContext.queryClient}>
              {children}
              <ReactQueryDevtools client={appContext.queryClient} />
            </QueryClientProvider>
          </MantineProvider>
        </>
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
