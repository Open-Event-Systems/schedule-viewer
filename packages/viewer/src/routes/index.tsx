import { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  createRoute,
  notFound,
  Outlet,
} from "@tanstack/react-router"
import { getEventsQueryOptions } from "../schedule.js"
import { ScheduleConfigProvider } from "@open-event-systems/schedule-components/config/context"
import { EventsRoute } from "./EventsRoute.js"
import { EventRoute } from "./EventRoute.js"
import { Layout } from "../Layout.js"
import { BookmarkAPIProvider, BookmarkStoreProvider } from "../bookmarks.js"
import { useState } from "react"
import { getAppContextQueryOptions } from "../config.js"

export type RouterContext = {
  configURL: string
  queryClient: QueryClient
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Layout,
})

export const eventsDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "events",
  async beforeLoad({ context }) {
    const { configURL, queryClient } = context
    const appCtx = await queryClient.fetchQuery(
      getAppContextQueryOptions(queryClient, configURL)
    )
    
    return {
      config: appCtx.config,
      bookmarkStore: appCtx.bookmarkStore,
      bookmarkAPI: appCtx.bookmarkAPI,
    }
  },
  async loader({ context }) {
    const { configURL, queryClient } = context

    // TODO: remove when https://github.com/TanStack/router/issues/3699 is fixed
    const appCtx = await queryClient.fetchQuery(
      getAppContextQueryOptions(queryClient, configURL)
    )
    
    const {config} = appCtx

    const events = await queryClient.fetchQuery(
      getEventsQueryOptions(config.url, config.timeZone)
    )

    return { events }
  },
  component: () => {
    const { bookmarkStore, bookmarkAPI } = eventsDataRoute.useRouteContext()
    const { config } = eventsDataRoute.useRouteContext()

    return (
      <ScheduleConfigProvider value={config}>
        <BookmarkStoreProvider value={bookmarkStore}>
          <BookmarkAPIProvider value={bookmarkAPI}>
            <Outlet />
          </BookmarkAPIProvider>
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
    const { queryClient, configURL } = context

    // TODO: remove when https://github.com/TanStack/router/issues/3699 is fixed
    const appCtx = await queryClient.fetchQuery(
      getAppContextQueryOptions(queryClient, configURL)
    )
    
    const {config} = appCtx

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
