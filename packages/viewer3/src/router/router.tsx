import type { AppContext, AppContextPromise } from "#src/app.js"
import { MantineProvider } from "@mantine/core"
import { awaitAppContext } from "@open-event-systems/schedule-react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRouter as tsCreateRouter } from "@tanstack/react-router"
import type { ReactNode } from "react"
import routeTree from "./routes/root.js"
import { parseSearch, stringifySearch } from "./search-params.js"

export type RouterContext = AppContext & {
  readonly appContextPromise: AppContextPromise
}

export const createRouter = (appContext: AppContext) => {
  const { basePath, theme } = appContext
  const queryClient = appContext.queryClient

  const appContextPromise = awaitAppContext(appContext)

  const router = tsCreateRouter({
    basepath: basePath,
    context: {
      ...appContext,
      appContextPromise,
    },
    routeTree,
    scrollRestoration: true,
    parseSearch,
    stringifySearch,
    Wrap: ({ children }: { children: ReactNode }) => {
      return (
        <MantineProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools client={queryClient} />
          </QueryClientProvider>
        </MantineProvider>
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
