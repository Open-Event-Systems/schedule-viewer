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

export const pagesRoute = createRoute({
  getParentRoute: () => filterStateRoute,
  path: "/{-$pageId}",
  component: lazyRouteComponent(
    () => import("./routes/pages.js"),
    "PagesRoute",
  ),
  async loader({ context, params }) {
    const { queryClient, config, scheduleAPI, selectionsAPI } = context
    const { pageId } = params

    const {
      itemsQueryKeys,
      itemsQueryFns,
      selectionsQueryKeys,
      selectionsQueryFns,
      parsers,
    } = await import("./route-loaders.js")

    const itemsPromise = queryClient.fetchQuery({
      queryKey: itemsQueryKeys.items(config.id, parsers),
      queryFn: itemsQueryFns.items(scheduleAPI, parsers),
      staleTime: 300000,
    })

    const selectionsPromise = queryClient.fetchQuery({
      queryKey: selectionsQueryKeys.sessionSelections(config.id, "bookmarks"),
      queryFn: selectionsQueryFns.sessionSelections(selectionsAPI, "bookmarks"),
      staleTime: 120000,
    })

    const countsPromise = queryClient.fetchQuery({
      queryKey: selectionsQueryKeys.bookmarkCounts(config.id),
      queryFn: selectionsQueryFns.bookmarkCounts(selectionsAPI),
      staleTime: 300000,
    })

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

    const {
      itemsQueryKeys,
      itemsQueryFns,
      selectionsQueryKeys,
      selectionsQueryFns,
      parsers,
    } = await import("./route-loaders.js")

    const itemsPromise = queryClient.fetchQuery({
      queryKey: itemsQueryKeys.items(config.id, parsers),
      queryFn: itemsQueryFns.items(scheduleAPI, parsers),
      staleTime: 300000,
    })

    const selectionsPromise = queryClient.fetchQuery({
      queryKey: selectionsQueryKeys.sessionSelections(config.id, "bookmarks"),
      queryFn: selectionsQueryFns.sessionSelections(selectionsAPI, "bookmarks"),
      staleTime: 120000,
    })

    const countsPromise = queryClient.fetchQuery({
      queryKey: selectionsQueryKeys.bookmarkCounts(config.id),
      queryFn: selectionsQueryFns.bookmarkCounts(selectionsAPI),
      staleTime: 300000,
    })

    const [{ event: events }, selections, counts] = await Promise.all([
      itemsPromise,
      selectionsPromise,
      countsPromise,
    ])

    const event = events.get(eventId)
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

export const mapRoute = createRoute({
  getParentRoute: () => rootRoute, // TODO
  path: "/map",
})
