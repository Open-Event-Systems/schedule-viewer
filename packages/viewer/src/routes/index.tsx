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
import { ScheduleLayout } from "../components/schedule-layout.js"
import { Loading } from "../components/Loading.js"
import { AppConfig, ViewerConfigProvider } from "../config.js"
import { NotFoundRoute } from "./NotFoundRoute.js"
import {
  getBookmarkCountsQueryOptions,
  getEventsQueryOptions,
  getSelectionsByIdQueryOptions,
  getSelectionsQueryOptions,
  getSetSelectionsMutationOptions,
} from "@open-event-systems/schedule-react"
import { ScheduleConfigProvider } from "@open-event-systems/schedule-react"
import { BookmarkAPIProvider } from "@open-event-systems/schedule-react"

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
      eventAPI: appConfig.eventAPI,
      bookmarkAPI: appConfig.bookmarkAPI,
      bookmarkServiceAPI: appConfig.bookmarkServiceAPI,
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
    const { config, queryClient, eventAPI, bookmarkAPI, bookmarkServiceAPI } =
      context

    const [events, counts, selections] = await Promise.all([
      queryClient.fetchQuery(getEventsQueryOptions(config, eventAPI)),
      queryClient.fetchQuery(
        getBookmarkCountsQueryOptions(config, bookmarkServiceAPI),
      ),
      queryClient.fetchQuery(getSelectionsQueryOptions(config, bookmarkAPI)),
    ])

    return {
      events,
      selections,
      counts,
    }
  },
  component: () => {
    const { bookmarkAPI, bookmarkServiceAPI, config } =
      eventsDataRoute.useRouteContext()

    return (
      <ViewerConfigProvider value={config}>
        <ScheduleConfigProvider value={config}>
          <BookmarkAPIProvider value={[bookmarkAPI, bookmarkServiceAPI]}>
            <Outlet />
          </BookmarkAPIProvider>
        </ScheduleConfigProvider>
      </ViewerConfigProvider>
    )
  },
  pendingComponent: Loading,
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
    const { queryClient, config, eventAPI } = context
    const events = await queryClient.fetchQuery(
      getEventsQueryOptions(config, eventAPI),
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
          title: `${loaderData?.event.title || "Event"}`,
        },
        loaderData?.event.description
          ? {
              name: "description",
              content: loaderData?.event.description,
            }
          : undefined,
      ],
    }
  },
  staleTime: Infinity,
})

export const shareScheduleRoute = createRoute({
  getParentRoute: () => eventsRoute,
  path: "share",
  async loader({ context }) {
    const { config, queryClient, bookmarkAPI } = context
    if (!bookmarkAPI) {
      throw notFound({ routeId: rootRouteId })
    }

    const selections = await queryClient.fetchQuery(
      getSelectionsQueryOptions(config, bookmarkAPI),
    )

    const mutation = queryClient
      .getMutationCache()
      .build(
        queryClient,
        getSetSelectionsMutationOptions(queryClient, config, bookmarkAPI),
      )

    const result = await mutation.execute(selections)

    return { shareId: result.id }
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
      getSelectionsByIdQueryOptions(config, bookmarkAPI, params.selectionId),
    )
    if (!selections) {
      throw notFound({ routeId: rootRouteId })
    }
    return { selections }
  },
})

export const mapLayoutRoute = createRoute({
  getParentRoute: () => eventsDataRoute,
  id: "mapLayout",
  component: lazyRouteComponent(
    () => import("../components/map-layout.js"),
    "MapLayout",
  ),
})

export const mapRoute = createRoute({
  getParentRoute: () => mapLayoutRoute,
  path: "map",
  beforeLoad({ context }) {
    const { config } = context
    if (!config.map?.src) {
      throw notFound()
    }
  },
  component: lazyRouteComponent(() => import("./MapRoute.js"), "MapRoute"),
})
