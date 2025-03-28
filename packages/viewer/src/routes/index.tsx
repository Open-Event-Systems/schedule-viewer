import { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  createRoute,
  HeadContent,
  lazyRouteComponent,
  notFound,
  Outlet,
  rootRouteId,
  Scripts,
} from "@tanstack/react-router"
import { getEventsQueryOptions } from "../schedule.js"
import { ScheduleConfigProvider } from "@open-event-systems/schedule-components/config/context"
import { ScheduleLayout } from "../components/schedule-layout.js"
import {
  BookmarkAPIProvider,
  getBookmarkCountsQueryOptions,
  getBookmarksByIdQueryOptions,
  getSessionBookmarksMutationOptions,
  getSessionBookmarksQueryOptions,
  getStoredBookmarksQueryOptions,
} from "../bookmarks.js"
import { Loading } from "../components/Loading.js"
import { AppConfig } from "../config.js"
import { chooseNewer } from "@open-event-systems/schedule-lib"
import { saveSelections } from "../local-storage.js"
import { NotFoundRoute } from "./NotFoundRoute.js"

export type RouterContext = {
  appConfigPromise: Promise<AppConfig>
  queryClient: QueryClient
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component() {
    return (
      <>
        <HeadContent />
        <Outlet />
        <Scripts />
      </>
    )
  },
  notFoundComponent() {
    return <NotFoundRoute />
  },
})

export const configRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "config",
  async beforeLoad({ context }) {
    const { appConfigPromise } = context

    const appConfig = await appConfigPromise

    return {
      config: appConfig.config,
      bookmarkAPI: appConfig.bookmarkAPI,
      sessionId: appConfig.sessionId,
      pageTitle: `${appConfig.config.title} Schedule`,
    }
  },
  async loader({ context }) {
    return { config: context.config }
  },
  head({ match }) {
    return {
      meta: [
        {
          title: match.context.pageTitle,
        },
      ],
    }
  },
  staleTime: Infinity,
  pendingComponent: Loading,
})

export const eventsDataRoute = createRoute({
  getParentRoute: () => configRoute,
  id: "events",
  async loader({ context }) {
    const { config, queryClient, bookmarkAPI } = context

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

    // update local selections
    const newer = chooseNewer(localSelections, sessionSelections)
    saveSelections(config.id, newer)

    return {
      events,
      selections: newer,
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
})

export const layoutRoute = createRoute({
  getParentRoute: () => eventsDataRoute,
  id: "layoutRoute",
  component: ScheduleLayout,
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
      getEventsQueryOptions(config.events, config.timeZone),
    )

    const event = events.get(eventId)
    if (!event) {
      throw notFound({ routeId: rootRouteId })
    }
    return { event }
  },
  head({ loaderData }) {
    return {
      meta: [
        {
          title: `${loaderData.event.title || "Event"}`,
        },
        loaderData.event.description
          ? {
              name: "description",
              content: loaderData.event.description,
            }
          : undefined,
      ],
    }
  },
})

export const shareScheduleRoute = createRoute({
  getParentRoute: () => eventsRoute,
  path: "share",
  async loader({ context }) {
    const { config, queryClient, bookmarkAPI } = context
    if (!bookmarkAPI) {
      throw notFound({ routeId: rootRouteId })
    }

    const [local, remote] = await Promise.all([
      queryClient.fetchQuery(getStoredBookmarksQueryOptions(config.id)),
      queryClient.fetchQuery(
        getSessionBookmarksQueryOptions(bookmarkAPI, config.id),
      ),
    ])
    const newer = chooseNewer(local, remote)

    const mutation = queryClient
      .getMutationCache()
      .build(
        queryClient,
        getSessionBookmarksMutationOptions(queryClient, bookmarkAPI, config.id),
      )

    const result = await mutation.execute(newer)

    return { shareId: result[0] }
  },
})

export const syncScheduleRoute = createRoute({
  getParentRoute: () => eventsRoute,
  path: "sync",
  async loader({ context }) {
    const { bookmarkAPI } = context
    if (!bookmarkAPI) {
      throw notFound({ routeId: rootRouteId })
    }
    return { syncId: context.sessionId }
  },
})

export const confirmSyncScheduleRoute = createRoute({
  getParentRoute: () => eventsRoute,
  path: "sync/$syncId",
})

export const sharedScheduleRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "shared/$selectionId",
  component: lazyRouteComponent(
    () => import("./shared-schedule-route.js"),
    "SharedScheduleRoute",
  ),
  async loader({ context, params }) {
    const { config, queryClient, bookmarkAPI } = context
    const selections = await queryClient.fetchQuery(
      getBookmarksByIdQueryOptions(bookmarkAPI, config.id, params.selectionId),
    )
    if (!selections) {
      throw notFound({ routeId: rootRouteId })
    }
    return { selections }
  },
})
