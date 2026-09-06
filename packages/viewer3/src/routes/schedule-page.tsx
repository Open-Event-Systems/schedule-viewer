import { createRoute, lazyRouteComponent } from "@tanstack/react-router"
import { rootRoute } from "./root.js"
import {
  pageSearchParamsSchema,
  type PageSearchParams,
} from "../search-params.js"
import { ScheduleLoader } from "../queries/schedule.js"
import { SelectionsLoader } from "../queries/selections.js"

export const schedulePageRoute = createRoute({
  path: "/$pageId",
  getParentRoute: () => rootRoute,
  validateSearch: (search): PageSearchParams =>
    pageSearchParamsSchema.parse(search),
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

export default schedulePageRoute
