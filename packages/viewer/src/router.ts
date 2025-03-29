import { createRouter } from "@tanstack/react-router"
import {
  configRoute,
  confirmSyncScheduleRoute,
  eventRoute,
  eventsDataRoute,
  eventsRoute,
  layoutRoute,
  rootRoute,
  RouterContext,
  sharedScheduleRoute,
  shareScheduleRoute,
  syncScheduleRoute,
} from "./routes/index.js"

const routeTree = rootRoute.addChildren([
  configRoute.addChildren([
    eventsDataRoute.addChildren([
      layoutRoute.addChildren([
        eventsRoute.addChildren([
          shareScheduleRoute,
          syncScheduleRoute,
          confirmSyncScheduleRoute,
        ]),
        eventRoute,
        sharedScheduleRoute,
      ]),
    ]),
  ]),
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
