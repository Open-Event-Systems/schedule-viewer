import { createRouter } from "@tanstack/react-router"
import type { SetupResult } from "./app.js"
import type { QueryClient } from "@tanstack/react-query"
import {
  defaultPageRoute,
  filterStateRoute,
  pagesLayoutRoute,
  rootRoute,
  setupRoute,
} from "./routes.js"

export type RouterContext = {
  setupPromise: Promise<SetupResult>
  queryClient: QueryClient
}

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: ReturnType<typeof makeRouter>
  }
}
export const makeRouter = (context: RouterContext) => {
  return createRouter({
    context,
    routeTree: rootRoute.addChildren([
      setupRoute.addChildren([
        filterStateRoute.addChildren([
          pagesLayoutRoute.addChildren([defaultPageRoute]),
        ]),
      ]),
    ]),
  })
}
