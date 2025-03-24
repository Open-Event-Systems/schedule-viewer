import { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  createRoute,
  lazyRouteComponent,
  notFound,
  Outlet,
} from "@tanstack/react-router"
import { getEventsQueryOptions } from "../schedule.js"
import { ScheduleConfigProvider } from "@open-event-systems/schedule-components/config/context"
import { Layout } from "../components/Layout.js"
import {
  BookmarkAPIProvider,
  getBookmarkCountsQueryOptions,
  getSessionBookmarksQueryOptions,
  getStoredBookmarksQueryOptions,
} from "../bookmarks.js"
import {
  BookmarkAPI,
  chooseNewer,
  RequiredScheduleConfig,
} from "@open-event-systems/schedule-lib"
import { Flex, Loader } from "@mantine/core"
import { Loading } from "../components/Loading.js"

export type RouterContext = {
  config: RequiredScheduleConfig
  queryClient: QueryClient
  bookmarkAPI?: BookmarkAPI
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({})

export const eventsDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "events",
  async loader({ context }) {
    const { config, queryClient, bookmarkAPI } = context

    const [events, localSelections, sessionSelections, counts] =
      await Promise.all([
        queryClient.fetchQuery(
          getEventsQueryOptions(config.url, config.timeZone),
        ),
        queryClient.fetchQuery(getStoredBookmarksQueryOptions(config.id)),
        queryClient.fetchQuery(
          getSessionBookmarksQueryOptions(bookmarkAPI, config.id),
        ),
        queryClient.fetchQuery(
          getBookmarkCountsQueryOptions(bookmarkAPI, config.id),
        ),
      ])

    return {
      events,
      selections: chooseNewer(localSelections, sessionSelections),
      counts,
    }
  },
  component: () => {
    const { bookmarkAPI, config } = eventsDataRoute.useRouteContext()

    return (
      <ScheduleConfigProvider value={config}>
        <BookmarkAPIProvider value={bookmarkAPI}>
          <Outlet />
        </BookmarkAPIProvider>
      </ScheduleConfigProvider>
    )
  },
  pendingComponent: Loading,
})

export const layoutRoute = createRoute({
  getParentRoute: () => eventsDataRoute,
  id: "layoutRoute",
  component: Layout,
})

export const eventsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("./EventsRoute.js"),
    "EventsRoute",
  ),
})

export const eventRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "events/$eventId",
  component: lazyRouteComponent(() => import("./EventRoute.js"), "EventRoute"),
  async loader({ context, params }) {
    const { eventId } = params
    const { queryClient, config } = context
    const events = await queryClient.fetchQuery(
      getEventsQueryOptions(config.url, config.timeZone),
    )

    const event = events.get(eventId)
    if (!event) {
      throw notFound()
    }
    return { event }
  },
})
