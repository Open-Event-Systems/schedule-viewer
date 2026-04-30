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
  type TagEntry,
  type TagsViewProps,
} from "@open-event-systems/schedule-react"
import { useNow } from "../../utils.js"
import { useCallback, useMemo } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useSessionSelectionsIfEnabled } from "../../filter.js"
import {
  makeItemNavPropsMap,
  makeItemsByIdMap,
  makeRenderItemDetailsFunc,
  makeRenderPillFunc,
} from "../../schedule.js"
import { useMapLocationMatchFunc } from "@open-event-systems/schedule-map"
import { scheduleProvidersRoute } from "../../routes.js"
import type { ViewConfig } from "../../types.js"
import { useFilterOptions } from "./hooks.js"

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

  const selectedDayKey = scheduleProvidersRoute.useSearch({
    select: (state) => state.day,
  })

  // Items
  const itemsArr = useMemo(() => iterToArr(items), [items])

  // Filtered items
  const filterOptions = useFilterOptions(viewConfig, !!sharedSelections)

  const sessionSelections = useSessionSelectionsIfEnabled(
    filterOptions.selectionsFilterOptions.length > 0,
  )

  const filteredItems = useFilteredItems(itemsArr, {
    ...filterOptions,
    bookmarked: sharedSelections ?? sessionSelections.bookmarks,
    visited: sessionSelections.visited,
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
        resetScroll: false,
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
