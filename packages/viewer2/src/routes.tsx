import {
  createRootRouteWithContext,
  createRoute,
  HeadContent,
  lazyRouteComponent,
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

export const pagesLayoutRoute = createRoute({
  getParentRoute: () => setupRoute,
  id: "pagesLayout",
  component: lazyRouteComponent(
    () => import("./routes/pages-layout.js"),
    "PagesLayoutRoute",
  ),
})

export const filterStateRoute = createRoute({
  getParentRoute: () => pagesLayoutRoute,
  id: "filterState",
  component: lazyRouteComponent(
    () => import("./routes/filter-state.js"),
    "FilterStateRoute",
  ),
})

export const defaultPageRoute = createRoute({
  getParentRoute: () => filterStateRoute,
  path: "/",
  component: lazyRouteComponent(() => import("./routes/page.js"), "PageRoute"),
})
