import { createRouter } from "@tanstack/react-router"
import {
  eventRoute,
  eventsDataRoute,
  eventsRoute,
  rootRoute,
  RouterContext,
} from "./routes/index.js"

const routeTree = rootRoute.addChildren([
  eventsDataRoute.addChildren([eventsRoute, eventRoute]),
])

export const router = createRouter({
  routeTree,
  context: {} as RouterContext,
  scrollRestoration: true,
  defaultPendingComponent: () => "Pending",
})

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: typeof router
  }
}
