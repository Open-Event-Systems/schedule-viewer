import {
  createRootRouteWithContext,
  createRoute,
  HeadContent,
  lazyRouteComponent,
  notFound,
  Outlet,
} from "@tanstack/react-router"
import type { RouterContext } from "./router.js"
import { MainLayoutRoute } from "./routes/main-layout.js"
import { Loading } from "./components/loading/loading.js"
import type { ScheduleType } from "@open-event-systems/schedule-react"

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component() {
    return (
      <>
        <HeadContent />
        <Outlet />
      </>
    )
  },
})

export const scheduleLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "scheduleLayout",
  component: MainLayoutRoute,
})

export const scheduleSetupRoute = createRoute({
  getParentRoute: () => scheduleLayoutRoute,
  id: "scheduleSetup",
  async beforeLoad({ context }) {
    const { setupPromise } = context
    const setup = await setupPromise
    return {
      ...setup,
    }
  },
  component: lazyRouteComponent(
    () => import("./routes/setup.js"),
    "ScheduleSetupRoute",
  ),
  pendingMs: 0,
  pendingComponent: Loading,
})

export const filterStateRoute = createRoute({
  getParentRoute: () => scheduleSetupRoute,
  id: "filterState",
  component: lazyRouteComponent(
    () => import("./routes/filter-state.js"),
    "FilterStateRoute",
  ),
})

export type PagesParams = Readonly<{
  view?: ScheduleType
  day?: string
  past?: boolean
  bookmarked?: boolean
}>

export const pagesRoute = createRoute({
  getParentRoute: () => filterStateRoute,
  path: "/{-$pageId}",
  validateSearch: (search: Record<string, unknown>): PagesParams => {
    const viewType = search.view
    const day = search.day
    const past = !!search.past
    const bookmarked = !!search.bookmarked
    return {
      ...(typeof viewType == "string" && viewType
        ? { view: viewType as ScheduleType }
        : {}),
      ...(typeof day == "string" ? { day } : {}),
      ...(past ? { past: true } : {}),
      ...(bookmarked ? { bookmarked: true } : {}),
    }
  },
  search: {
    middlewares: [
      ({ search, next }) => {
        const { past, bookmarked, ...other } = next(search)

        return {
          ...other,
          ...(past ? { past: true } : {}),
          ...(bookmarked ? { bookmarked: true } : {}),
        }
      },
    ],
  },
  component: lazyRouteComponent(
    () => import("./routes/pages.js"),
    "PagesRoute",
  ),
  async loader({ context, params }) {
    const { queryClient, config, scheduleAPI, selectionsAPI } = context
    const { pageId } = params

    const { itemQueryOptions, selectionsQueryOptions, parsers } = await import(
      "./route-loaders.js"
    )

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    const selectionsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.sessionSelections(
        selectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    const countsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.bookmarkCounts(selectionsAPI, config.id),
    )

    const [items, selections, counts] = await Promise.all([
      itemsPromise,
      selectionsPromise,
      countsPromise,
    ])

    const selectedPageId = pageId || config.pages[0]?.id
    const page = config.pages.find((p) => p.id == selectedPageId)
    if (!page) {
      throw notFound()
    }

    return { pageConfig: page, items, selections, counts }
  },
})

export const eventDetailsRoute = createRoute({
  getParentRoute: () => filterStateRoute,
  path: "/events/$eventId",
  component: lazyRouteComponent(
    () => import("./routes/details.js"),
    "EventDetailsRoute",
  ),
  async loader({ params, context }) {
    const { eventId } = params
    const { config, queryClient, scheduleAPI, selectionsAPI } = context

    const { itemQueryOptions, selectionsQueryOptions, parsers } = await import(
      "./route-loaders.js"
    )

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    const selectionsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.sessionSelections(
        selectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    const countsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.bookmarkCounts(selectionsAPI, config.id),
    )

    const [
      {
        byType: { event: events },
      },
      selections,
      counts,
    ] = await Promise.all([itemsPromise, selectionsPromise, countsPromise])

    const event = events.find((e) => e.id == eventId)
    if (!event) {
      throw notFound()
    }

    return {
      event,
      selections,
      counts,
    }
  },
})

export const mapSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "mapSetup",
  async beforeLoad({ context }) {
    const { setupPromise } = context
    const setup = await setupPromise
    return {
      ...setup,
    }
  },
  component: lazyRouteComponent(
    () => import("./routes/setup.js"),
    "MapSetupRoute",
  ),
  pendingMs: 0,
  pendingComponent: Loading,
})

export const mapRoute = createRoute({
  getParentRoute: () => mapSetupRoute, // TODO
  path: "/map",
  component: lazyRouteComponent(() => import("./routes/map.js"), "MapRoute"),
})
