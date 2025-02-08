import { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  createRoute,
  isNotFound,
  notFound,
  Outlet,
} from "@tanstack/react-router"
import {
  getEventsQueryOptions,
  getScheduleConfigQueryOptions,
} from "../schedule.js"
import { ScheduleConfigProvider } from "@open-event-systems/schedule-components/config/context"
import { EventsRoute } from "./EventsRoute.js"
import { BookmarkStore } from "../bookmarks.js"
import { EventRoute } from "./EventRoute.js"
import { Layout } from "../Layout.js"

export type RouterContext = {
  configURL: string
  queryClient: QueryClient
  bookmarkStore: BookmarkStore
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Layout,
})

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

export const eventRoute = createRoute({
  getParentRoute: () => eventsDataRoute,
  path: "events/$eventId",
  component: EventRoute,
  async loader({ context, params }) {
    const { eventId } = params
    const { configURL, queryClient } = context

    const config = await queryClient.fetchQuery(
      getScheduleConfigQueryOptions(configURL)
    )

    const events = await queryClient.fetchQuery(
      getEventsQueryOptions(config.url, config.timeZone)
    )

    const event = events.get(eventId)
    if (!event) {
      throw notFound()
    }
    return { event }
  },
})
