import {
  createRoute,
  lazyRouteComponent,
  notFound,
} from "@tanstack/react-router"
import { parseSearchParams } from "../../hooks/filter-location-state.js"
import { ScheduleLoader } from "../../queries/schedule.js"
import { SelectionsLoader } from "../../queries/selections.js"
import { contextRoute } from "./root.js"

const schedulePageRoutes = createRoute({
  id: "schedule",
  getParentRoute: () => contextRoute,
})

export const schedulePageDataRoute = createRoute({
  id: "schedulePageData",
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
})

export const indexRoute = createRoute({
  path: "/",
  getParentRoute: () => schedulePageDataRoute,
})

export const schedulePageRoute = createRoute({
  path: "/$pageId/{-$viewType}/{-$day}",
  getParentRoute: () => schedulePageDataRoute,
  loader: async ({
    context: { config: configPromise },
    params: { pageId, viewType, day },
  }) => {
    const config = await configPromise

    // check page existence
    const pageConfig = config.pages[pageId]
    if (!pageConfig) {
      throw notFound()
    }

    // check view type
    const defaultViewType = [...Object.keys(pageConfig.views)][0]
    if (!defaultViewType) {
      throw notFound()
    }

    const viewConfig = pageConfig.views[viewType ?? defaultViewType]
    if (!viewConfig) {
      throw notFound()
    }

    // check day filter
    if (viewConfig.byDay != "filter" && day) {
      // day was specified, but not supported by the view
      throw schedulePageRoute.redirect({
        to: ".",
        params: (prev) => ({ ...prev, day: undefined }),
        search: true,
        state: true,
        hash: true,
        replace: true,
      })
    }

    return {
      pageConfig,
      viewConfig,
    }
  },
  component: lazyRouteComponent(
    () => import("../components/schedule-page/schedule-page.js"),
    "SchedulePageRoute",
  ),
})

export default schedulePageRoutes.addChildren([
  schedulePageDataRoute.addChildren([indexRoute, schedulePageRoute]),
])
