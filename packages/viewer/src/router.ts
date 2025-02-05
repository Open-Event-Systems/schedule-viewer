import { createRouter } from "@tanstack/react-router"
import {
  eventsDataRoute,
  eventsRoute,
  rootRoute,
  RouterContext,
} from "./routes/index.js"

const routeTree = rootRoute.addChildren([
  eventsDataRoute.addChildren([eventsRoute]),
])

export const router = createRouter({
  routeTree,
  context: {} as RouterContext,
  defaultPendingComponent: () => "Pending",
})

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: typeof router
  }
}
