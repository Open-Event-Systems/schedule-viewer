import { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  createRoute,
  notFound,
  Outlet,
} from "@tanstack/react-router"
import {
  getEventsQueryOptions,
  getScheduleConfigQueryOptions,
} from "../schedule.js"
import { ScheduleConfigProvider } from "@open-event-systems/schedule-components/config/context"
import { EventsRoute } from "./EventsRoute.js"
import { EventRoute } from "./EventRoute.js"
import { Layout } from "../Layout.js"
import { BookmarkStore } from "@open-event-systems/schedule-lib"
import { BookmarkStoreProvider } from "../bookmarks.js"
import { useState } from "react"

export type RouterContext = {
  configURL: string
  queryClient: QueryClient
  bookmarkStoreFactory: (scheduleId: string) => BookmarkStore
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
    const { bookmarkStoreFactory } = eventsDataRoute.useRouteContext()
    const { config } = eventsDataRoute.useLoaderData()
    const [bookmarksStore] = useState(() => {
      return bookmarkStoreFactory(config.id)
    })

    return (
      <ScheduleConfigProvider value={config}>
        <BookmarkStoreProvider value={bookmarksStore}>
          <Outlet />
        </BookmarkStoreProvider>
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
