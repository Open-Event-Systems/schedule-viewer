import { createRoute, lazyRouteComponent } from "@tanstack/react-router"
import { contextRoute } from "./root.js"
import { ScheduleLoader } from "../../queries/schedule.js"
import { SelectionsLoader } from "../../queries/selections.js"
import { parseSearchParams } from "../../hooks/filter-location-state.js"

const schedulePageRoutes = createRoute({
  id: "schedule",
  getParentRoute: () => contextRoute,
})

export const indexRoute = createRoute({
  path: "/",
  getParentRoute: () => schedulePageRoutes,
})

export const schedulePageRoute = createRoute({
  path: "/$pageId",
  getParentRoute: () => schedulePageRoutes,
  validateSearch: parseSearchParams,
  loaderDeps: ({ search }) => {
    return {
      bookmarked: search.bookmarked,
      unvisited: search.unvisited,
    }
  },
  loader: async ({
    context: { appContextPromise },
    deps: { bookmarked, unvisited },
  }) => {
    const itemsPromise = ScheduleLoader.items(appContextPromise)
    const selectionsPromise = Promise.all([
      SelectionsLoader.sessionSelections(appContextPromise, "bookmarks"),
      SelectionsLoader.sessionSelections(appContextPromise, "visited"),
    ])

    // Load selections, but only await here if needed for filtering
    const needSelections = !!bookmarked || !!unvisited
    await Promise.all([itemsPromise, needSelections && selectionsPromise])
  },
  component: lazyRouteComponent(
    () => import("./components/schedule-page/schedule-page.js"),
    "SchedulePageRoute",
  ),
})

export default schedulePageRoutes.addChildren([
  indexRoute,
  schedulePageRoute,
])
