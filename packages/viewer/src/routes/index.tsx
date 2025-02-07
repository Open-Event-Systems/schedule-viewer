import { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  createRoute,
  Outlet,
} from "@tanstack/react-router"
import { RequiredScheduleConfig } from "@open-event-systems/schedule-lib"
import {
  getEventsQueryOptions,
  getScheduleConfigQueryOptions,
} from "../schedule.js"
import { ScheduleConfigProvider } from "@open-event-systems/schedule-components/config/context"
import { EventsRoute } from "./EventsRoute.js"
import { BookmarkStore } from "../bookmarks.js"

export type RouterContext = {
  configURL: string
  queryClient: QueryClient
  bookmarkStore: BookmarkStore
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({})

export const eventsDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "events",
  async loader({ context }) {
    const { configURL, queryClient } = context

    const config = await queryClient.fetchQuery(
      getScheduleConfigQueryOptions(configURL)
    )

    const events = await queryClient.fetchQuery(
      getEventsQueryOptions(config.url, config.timeZone)
    )

    return { config, events }
  },
  component: () => {
    const { config } = eventsDataRoute.useLoaderData()
    return (
      <ScheduleConfigProvider value={config}>
        <Outlet />
      </ScheduleConfigProvider>
    )
  },
})

export const eventsRoute = createRoute({
  getParentRoute: () => eventsDataRoute,
  path: "/",
  component: EventsRoute,
})
