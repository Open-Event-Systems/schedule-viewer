import {
  createRootRouteWithContext,
  createRoute,
  HeadContent,
  lazyRouteComponent,
  notFound,
  Outlet,
} from "@tanstack/react-router"
import type { RouterContext } from "./router.js"
import {
  itemsQueryFns,
  itemsQueryKeys,
  selectionsQueryFns,
  selectionsQueryKeys,
} from "@open-event-systems/schedule-react"
import { parsers } from "./schedule.js"

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

export const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "setup",
  async beforeLoad({ context }) {
    const { setupPromise } = context
    const setup = await setupPromise
    return {
      ...setup,
    }
  },
  async loader({ context }) {
    const { config, scheduleAPI, selectionsAPI, queryClient } = context

    const items = await queryClient.fetchQuery({
      queryKey: itemsQueryKeys.items(config.id, parsers),
      queryFn: itemsQueryFns.items(scheduleAPI, parsers),
      staleTime: 300000,
    })

    const bookmarks = await queryClient.fetchQuery({
      queryKey: selectionsQueryKeys.sessionSelections(config.id, "bookmarks"),
      queryFn: selectionsQueryFns.sessionSelections(selectionsAPI, "bookmarks"),
      staleTime: 120000,
    })

    return {
      items,
      events: items.event,
      vendors: items.vendor,
      mapFlags: items["map-flag"],
      bookmarks,
    }
  },
  component: lazyRouteComponent(
    () => import("./routes/setup.js"),
    "SetupRoute",
  ),
})

export const mainLayoutRoute = createRoute({
  getParentRoute: () => setupRoute,
  id: "mainLayout",
  component: lazyRouteComponent(
    () => import("./routes/main-layout.js"),
    "MainLayout",
  ),
})

export const filterStateRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
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
    const { config } = context
    const { pageId } = params

    const selectedPageId = pageId || config.pages[0]?.id
    const page = config.pages.find((p) => p.id == selectedPageId)
    if (!page) {
      throw notFound()
    }

    return { pageConfig: page }
  },
})

export const eventDetailsRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/events/$eventId",
  component: lazyRouteComponent(
    () => import("./routes/details.js"),
    "EventDetailsRoute",
  ),
  async loader({ params, context }) {
    const { eventId } = params
    const { config, queryClient, scheduleAPI } = context

    const { event: events } = await queryClient.fetchQuery({
      queryKey: itemsQueryKeys.items(config.id, parsers),
      queryFn: itemsQueryFns.items(scheduleAPI, parsers),
    })

    const event = events.get(eventId)
    if (!event) {
      throw notFound()
    }

    return {
      event,
    }
  },
})
