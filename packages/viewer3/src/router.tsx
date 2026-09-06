import { createRouter as tsCreateRouter } from "@tanstack/react-router"
import { type QueryClient } from "@tanstack/react-query"
import routeTree from "./routes/root.js"
import { parseSearch, stringifySearch } from "./search-params.js"
import { awaitAppContext, type AppContextValue, type InitialAppContextValue } from "./hooks/app.js"

export type RouterContext = Readonly<{
  queryClient: QueryClient
  appContext: InitialAppContextValue
  appContextPromise: Promise<AppContextValue>
}>

export const createRouter = ({
  basepath,
  initialAppContext,
}: {
  basepath?: string
  initialAppContext: InitialAppContextValue
}) => {
  return tsCreateRouter({
    basepath,
    context: {
      queryClient: initialAppContext.queryClient,
      appContext: initialAppContext,
      appContextPromise: awaitAppContext(initialAppContext),
    },
    routeTree,
    scrollRestoration: true,
    parseSearch,
    stringifySearch,
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
