import type { PageConfig, ViewConfig } from "#src/config/config.js"
import { useScheduleData } from "#src/hooks/schedule.js"
import { useNow } from "#src/hooks/time.js"
import {
  getDefaultDay,
  iterToArr,
  makeIdFilter,
  makeItemTypeFilter,
  makePastItemFilter,
  makeTagFilter,
  makeTagLogicFilter,
  sortIntervalsByStartDate,
  toOccurrenceArray,
  type Amenity,
  type Day,
  type ScheduleEvent,
  type ScheduleItem,
  type ScheduleItemOccurrence,
  type ScheduleItemSeries,
  type Vendor,
} from "@open-event-systems/schedule-lib"
import {
  useSearchIndex,
  useSearchResults,
  type ViewSelectProps,
} from "@open-event-systems/schedule-react"
import { getRouteApi, useLocation } from "@tanstack/react-router"
import type { Dayjs } from "dayjs"
import { useCallback, useMemo } from "react"

const routeApi = getRouteApi(
  "/loading/schedule/schedulePageData/$pageId/{-$viewType}/{-$day}",
)

export const useFilterCount = (viewConfig: ViewConfig): number => {
  const { search, past } = routeApi.useSearch({
    select: ({ search, past }) => ({ search, past }),
  })
  const disabledTags = useLocation({
    select: ({ state: { disabledTags } }) => disabledTags,
  })

  let count = 0

  if (search) {
    count++
  }

  if (viewConfig.features.has("past-events-filter") && past != true) {
    count++
  }

  if (disabledTags && disabledTags.length > 0) {
    count++
  }

  return count
}

export const useViewSelect = (
  pageConfig: PageConfig,
  days: Iterable<Day>,
  now: Dayjs,
): {
  options: ViewSelectProps["data"]
  setViewType: (view: string | null) => void
} => {
  const navigate = routeApi.useNavigate()

  const options = useMemo(() => {
    const opts = []
    for (const [key, cfg] of Object.entries(pageConfig.views)) {
      opts.push({ label: cfg.name, value: key })
    }
    return opts
  }, [pageConfig.views])

  const setViewType = useCallback(
    (view: string | null) => {
      if (!view) {
        return
      }

      const destViewCfg = pageConfig.views[view]

      navigate({
        to: "/$pageId/{-$viewType}/{-$day}",
        params: (prev) => {
          const newObj = { ...prev, viewType: view }

          // unset day if not filtered in the new view
          if (!destViewCfg || destViewCfg.byDay != "filter") {
            newObj.day = undefined
          } else if (!prev.day) {
            // set day to default day
            const defaultDay = getDefaultDay(days, now)
            newObj.day = defaultDay?.key
          }

          return newObj
        },
        search: (prev) => {
          const newObj = { ...prev }

          // remove params unsupported in new view

          if (!destViewCfg || !destViewCfg.features.has("bookmarked-filter")) {
            delete newObj.bookmarked
          }

          if (!destViewCfg || !destViewCfg.features.has("unvisited-filter")) {
            delete newObj.unvisited
          }

          if (!destViewCfg || !destViewCfg.features.has("past-events-filter")) {
            delete newObj.past
          }

          return newObj
        },
        state: (prev) => {
          const newObj = { ...prev }

          // remove params unsupported in new view
          if (!destViewCfg || !destViewCfg.features.has("tag-filter")) {
            delete newObj.tagFilterMode
            delete newObj.disabledTags
          }

          return newObj
        },
        hash: true,
        replace: true,
      })
    },
    [navigate, pageConfig.views, days],
  )

  return { options, setViewType }
}

export const useSchedulePageData = (
  pageConfig: PageConfig,
): readonly ScheduleItemSeries<ScheduleEvent | Vendor | Amenity>[] => {
  const data = useScheduleData()
  return useMemo(() => {
    const types = (["event", "vendor", "amenity"] as const).filter((t) =>
      pageConfig.types.has(t),
    )

    const typeFilter = makeItemTypeFilter(types)
    const otherFilters: ((item: ScheduleItemSeries) => boolean)[] = []

    if (pageConfig.requireTags.length > 0) {
      otherFilters.push(makeTagLogicFilter("include", pageConfig.requireTags))
    }

    if (pageConfig.excludeTags.length > 0) {
      console.log(pageConfig.excludeTags)
      otherFilters.push(makeTagLogicFilter("exclude", pageConfig.excludeTags))
    }

    return iterToArr(data)
      .filter(typeFilter)
      .filter((item) => otherFilters.every((f) => f(item)))
  }, [pageConfig.types, data])
}

export const useOccurrences = <T extends ScheduleItem>(
  items: readonly ScheduleItemSeries<T>[],
) => {
  return useMemo(() => {
    const occs = []
    for (const item of items) {
      occs.push(...toOccurrenceArray(item))
    }
    sortIntervalsByStartDate(occs)
    return occs
  }, [items])
}

export const useFilteredItemOccurrences = <T extends ScheduleItem>(
  occurrences: readonly ScheduleItemOccurrence<T>[],
) => {
  const now = useNow()

  const { viewConfig } = routeApi.useLoaderData()

  const allowHidePast = viewConfig.features.has("past-events-filter")

  const { disabledTags, tagFilterMode } = useLocation({
    select: ({ state: { disabledTags, tagFilterMode } }) => ({
      disabledTags,
      tagFilterMode,
    }),
    structuralSharing: true,
  })

  const { bookmarked, past, search, unvisited } = routeApi.useSearch({
    select: ({ bookmarked, past, search, unvisited }) => ({
      bookmarked,
      past,
      search,
      unvisited,
    }),
    structuralSharing: true,
  })

  const index = useSearchIndex()
  const searchResults = useSearchResults(index, search)

  return useMemo(() => {
    const filters: ((item: ScheduleItemOccurrence<T>) => boolean)[] = []

    if (searchResults) {
      filters.push(makeIdFilter(searchResults))
    }

    if (disabledTags && disabledTags.length > 0) {
      filters.push(makeTagFilter(tagFilterMode ?? "include", disabledTags))
    }

    if (allowHidePast && past !== true) {
      filters.push(makePastItemFilter(now))
    }

    // TODO: bookmarked/unvisited

    return occurrences.filter((occ) => filters.every((f) => f(occ)))
  }, [
    now,
    allowHidePast,
    disabledTags,
    tagFilterMode,
    bookmarked,
    past,
    search,
    searchResults,
    unvisited,
    occurrences,
  ])
}
