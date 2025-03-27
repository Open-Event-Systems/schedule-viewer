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
import {
  BookmarkAPIProvider,
  getBookmarkCountsQueryOptions,
  getSessionBookmarksQueryOptions,
  getStoredBookmarksQueryOptions,
} from "../bookmarks.js"
import { AppContext } from "../config.js"
import { chooseNewer } from "@open-event-systems/schedule-lib"
import { Box, Flex, Loader, Skeleton } from "@mantine/core"

export type RouterContext = {
  configURL: string
  queryClient: QueryClient
  appContextPromise: Promise<AppContext>
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Layout,
})

export const eventsDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "events",
  async beforeLoad({ context }) {
    const { appContextPromise } = context
    const appCtx = await appContextPromise

    return {
      config: appCtx.config,
      bookmarkAPI: appCtx.bookmarkAPI,
    }
  },
  async loader({ context }) {
    const { queryClient, appContextPromise } = context

    // TODO: remove when https://github.com/TanStack/router/issues/3699 is fixed
    const appCtx = await appContextPromise
    const { config, bookmarkAPI } = appCtx

    const [events, localSelections, sessionSelections, counts] =
      await Promise.all([
        queryClient.fetchQuery(
          getEventsQueryOptions(config.events, config.timeZone),
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
  pendingComponent() {
    return (
      <>
        <Flex mih={500} justify="center" align="center">
          <Loader type="dots" />
        </Flex>
      </>
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
    const { queryClient, appContextPromise } = context

    // TODO: remove when https://github.com/TanStack/router/issues/3699 is fixed
    const appCtx = await appContextPromise
    const { config } = appCtx

    const events = await queryClient.fetchQuery(
      getEventsQueryOptions(config.events, config.timeZone),
    )

    const event = events.get(eventId)
    if (!event) {
      throw notFound()
    }
    return { event }
  },
})
