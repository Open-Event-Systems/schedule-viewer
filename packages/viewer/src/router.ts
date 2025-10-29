import { createRouter } from "@tanstack/react-router"
import {
  configRoute,
  confirmSyncScheduleRoute,
  eventRoute,
  dataRoute,
  eventsRoute,
  layoutRoute,
  mapLayoutRoute,
  mapRoute,
  rootRoute,
  type RouterContext,
  sharedScheduleRoute,
  shareScheduleRoute,
  syncScheduleRoute,
  eventFilterRoute,
  eventDetailsRoute,
} from "./routes/index.js"

const routeTree = rootRoute.addChildren([
  configRoute.addChildren([
    dataRoute.addChildren([
      eventFilterRoute.addChildren([
        eventDetailsRoute.addChildren([
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
      mapLayoutRoute.addChildren([mapRoute]),
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
