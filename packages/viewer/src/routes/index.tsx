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
  FilterProvider,
  getBookmarkCountsQueryOptions,
  getItemsQueryOptions,
  getSelectionsByIdQueryOptions,
  getSelectionsQueryOptions,
  getSetSelectionsMutationOptions,
  ScheduleAPIProvider,
  useFilterState,
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
      scheduleAPI: appConfig.scheduleAPI,
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

export const dataRoute = createRoute({
  getParentRoute: () => configRoute,
  id: "data",
  async loader({ context }) {
    const {
      config,
      queryClient,
      scheduleAPI,
      bookmarkAPI,
      bookmarkServiceAPI,
    } = context

    const [{ items, events, vendors }, counts, selections] = await Promise.all([
      queryClient.fetchQuery(getItemsQueryOptions(config, scheduleAPI)),
      queryClient.fetchQuery(
        getBookmarkCountsQueryOptions(config, bookmarkServiceAPI),
      ),
      queryClient.fetchQuery(getSelectionsQueryOptions(config, bookmarkAPI)),
    ])

    return {
      items,
      events,
      vendors,
      selections,
      counts,
    }
  },
  component: () => {
    const { scheduleAPI, bookmarkAPI, bookmarkServiceAPI, config } =
      dataRoute.useRouteContext()

    return (
      <ViewerConfigProvider value={config}>
        <ScheduleConfigProvider value={config}>
          <ScheduleAPIProvider value={scheduleAPI}>
            <BookmarkAPIProvider value={[bookmarkAPI, bookmarkServiceAPI]}>
              <Outlet />
            </BookmarkAPIProvider>
          </ScheduleAPIProvider>
        </ScheduleConfigProvider>
      </ViewerConfigProvider>
    )
  },
  pendingComponent: Loading,
})

export const eventFilterRoute = createRoute({
  getParentRoute: () => dataRoute,
  id: "eventFilter",
  component: () => {
    const filterState = useFilterState()
    return (
      <FilterProvider value={filterState}>
        <Outlet />
      </FilterProvider>
    )
  },
})

export const eventDetailsRoute = createRoute({
  getParentRoute: () => eventFilterRoute,
  id: "eventDetails",
  component: lazyRouteComponent(
    () => import("./item-details-route.js"),
    "ItemDetailsRoute",
  ),
})

export const layoutRoute = createRoute({
  getParentRoute: () => eventDetailsRoute,
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
    const { queryClient, config, scheduleAPI } = context
    const { events } = await queryClient.fetchQuery(
      getItemsQueryOptions(config, scheduleAPI),
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
  getParentRoute: () => dataRoute,
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
