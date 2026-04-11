import {
  getDays,
  getDefaultDay,
  iterToArr,
  type Day,
  type DetailedScheduleItem,
} from "@open-event-systems/schedule-lib"
import { useViewerConfig } from "../../config.js"
import {
  ItemPills,
  makeTagIndicatorFunc,
  Schedule,
  useFilteredItems,
  type CatalogViewProps,
  type DailyAgendaViewProps,
  type DailyCatalogViewProps,
  type FullAgendaViewProps,
  type ItemPillsProps,
  type SelectionsFilterOption,
  type TagEntry,
  type TagsViewProps,
} from "@open-event-systems/schedule-react"
import { useNow, useRequiredContext } from "../../utils.js"
import { useCallback, useMemo } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import {
  FilterStateStoreContext,
  useSessionSelectionsIfEnabled,
} from "../../filter.js"
import { useStore } from "zustand"
import { useShallow } from "zustand/react/shallow"
import {
  makeItemNavPropsMap,
  makeItemsByIdMap,
  makeRenderItemDetailsFunc,
  makeRenderPillFunc,
} from "../../schedule.js"
import { useMapLocationMatchFunc } from "@open-event-systems/schedule-map"
import { scheduleProvidersRoute } from "../../routes.js"
import type { ViewConfig } from "../../types.js"

export type ScheduleContainerProps = {
  items?: Iterable<DetailedScheduleItem>
  tags?: Iterable<TagEntry>
  viewConfig: ViewConfig
  getCurrentURL: () => string
  sharedSelections?: Iterable<string>
}

type ScheduleProps = DailyAgendaViewProps &
  FullAgendaViewProps &
  DailyCatalogViewProps &
  CatalogViewProps &
  TagsViewProps

/**
 * Wraps {@link Schedule} to handle business logic.
 */
export const ScheduleContainer = (props: ScheduleContainerProps) => {
  const { items, tags, viewConfig, getCurrentURL, sharedSelections } = props

  const config = useViewerConfig()
  const now = useNow()
  const router = useRouter()
  const navigate = useNavigate()

  // Params

  const [selectedDayKey, optShowPastEvents, optOnlyBookmarked] =
    scheduleProvidersRoute.useSearch({
      select: (state) => [state.day, state.past, state.bookmarked] as const,
      structuralSharing: true,
    })

  const selectionsFilterOptions = scheduleProvidersRoute.useSearch({
    select: (state) => {
      const opts: SelectionsFilterOption[] = []
      if (state.bookmarked) {
        opts.push("bookmarked")
      }
      if (state.unvisited) {
        opts.push("unvisited")
      }
      return opts
    },
    structuralSharing: true,
  })

  const filterStore = useRequiredContext(FilterStateStoreContext)
  const [text, disabledTags] = useStore(
    filterStore,
    useShallow((state) => [state.text, state.disabledTags]),
  )

  const onlyBookmarked =
    !!sharedSelections || (viewConfig.onlyBookmarked ?? optOnlyBookmarked)
  const showPastEvents = viewConfig.showPastEvents ?? optShowPastEvents

  // Items
  const itemsArr = useMemo(() => iterToArr(items), [items])

  // Selections

  const sessionSelections = useSessionSelectionsIfEnabled(onlyBookmarked)

  // Filtered items

  const filteredItems = useFilteredItems(itemsArr, {
    disabledTags,
    text,
    now,
    selectionsFilterOptions,
    showPastEvents,
    bookmarked: sharedSelections ?? sessionSelections,
    visited: [], // TODO: visited
  })

  // Day related setup

  const [days, defaultDay] = useMemo(() => {
    const days = getDays(
      itemsArr.filter(
        (t): t is typeof t & { readonly start: Date } => !!t.start,
      ),
      config.dayChangeHour,
    )

    const defaultDay = getDefaultDay(days, now)
    return [days, defaultDay]
  }, [itemsArr, config.dayChangeHour, now])

  const selectedDay = useMemo(() => {
    const day = days.find((d) => d.key == selectedDayKey)
    return day ?? defaultDay
  }, [selectedDayKey, days, defaultDay])

  const onSelectDay = useCallback(
    (day: Day) => {
      navigate({
        to: ".",
        state: true,
        params: true,
        hash: true,
        search: (prev) => ({
          ...prev,
          day: day.key,
        }),
      })
    },
    [navigate],
  )

  const getDayHref = useCallback(
    (day: Day) => {
      return (
        router.origin +
        router.history.createHref(
          router.buildLocation({
            to: ".",
            state: true,
            params: true,
            hash: true,
            search: (prev) => ({
              ...prev,
              day: day.key,
            }),
          }).href,
        )
      )
    },
    [router],
  )

  // Item pill rendering

  const mapLocMatchFunc = useMapLocationMatchFunc(config.map?.locations)

  const itemPropsMap = useMemo(
    () => makeItemNavPropsMap(router, getCurrentURL, mapLocMatchFunc, items),
    [router, getCurrentURL, mapLocMatchFunc, items],
  )

  const itemsByIdMap = useMemo(() => makeItemsByIdMap(itemsArr), [itemsArr])
  const renderItemDetailsFunc = useMemo(
    () => makeRenderItemDetailsFunc(itemPropsMap, itemsByIdMap),
    [itemPropsMap, itemsByIdMap],
  )

  const tagIndicatorFunc = useMemo(
    () => makeTagIndicatorFunc(config.tagIndicators),
    [config.tagIndicators],
  )

  const renderItemPill = useMemo(
    () =>
      makeRenderPillFunc(renderItemDetailsFunc, tagIndicatorFunc, itemPropsMap),
    [renderItemDetailsFunc, tagIndicatorFunc, itemPropsMap],
  )

  const renderItemPills = useCallback(
    (props: ItemPillsProps) => (
      <ItemPills {...props} renderPill={renderItemPill} />
    ),
    [renderItemPill],
  )

  const scheduleConfig: ScheduleProps = {
    ...viewConfig,
    dayChangeHour: config.dayChangeHour,
    dayFormat: config.dayFormat,
    now,
    days,
    selectedDay,
    onSelectDay,
    getDayHref,
    tags,
    tagIndicators: config.tagIndicators,
    items: filteredItems,
    renderItemPills,
  }

  return <Schedule {...scheduleConfig} type={viewConfig.type} />
}
