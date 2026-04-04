import {
  getDays,
  getDefaultDay,
  type Day,
  type DetailedScheduleItem,
  type ScheduleItemCollection,
} from "@open-event-systems/schedule-lib"
import {
  useViewerConfig,
  type PageConfig,
  type ViewConfig,
} from "../../config.js"
import { FilterStateStoreContext, usePageFilteredItems } from "../../filter.js"
import { Box, useProps } from "@mantine/core"
import {
  ItemPills,
  makeTagIndicatorFunc,
  Markdown,
  Schedule,
  SchedulePage,
  ShareMenu,
  useFilteredItems,
  useRelevantTags,
  type CatalogViewProps,
  type DailyAgendaViewProps,
  type FullAgendaViewProps,
  type ItemPillsProps,
  type SchedulePageProps,
  type TagsViewProps,
} from "@open-event-systems/schedule-react"
import { useCallback, useMemo } from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"

import { iterToArr, useNow, useRequiredContext } from "../../utils.js"
import {
  makeItemNavPropsMap,
  makeRenderItemDetailsFunc,
  makeRenderPillFunc,
} from "../../schedule.js"
import { useMapLocationMatchFunc } from "@open-event-systems/schedule-map"
import { useSessionSelectionsIfEnabled } from "../../filter.js"
import { useStore } from "zustand"

import classes from "./page.module.scss"
import clsx from "clsx"
import {
  BookmarkFilterContainer,
  PastEventsFilterContainer,
  TagFilterContainer,
  TextFilterContainer,
  ViewSelectContainer,
} from "../filters/filters.js"
import { useShallow } from "zustand/react/shallow"
import { type ScheduleViewComponentType } from "../../types.js"

declare module "@tanstack/react-router" {
  interface HistoryState {
    scheduleViewType?: ScheduleViewComponentType
  }
}

export type PageProps = {
  pageConfig: PageConfig
  origin: string
  currentURL: string
  items?: ScheduleItemCollection<DetailedScheduleItem>
} & SchedulePageProps

export const Page = (props: PageProps) => {
  const { pageConfig, origin, currentURL, items, ...other } = useProps(
    "Page",
    {},
    props,
  )

  const config = useViewerConfig()

  const filterStore = useRequiredContext(FilterStateStoreContext)

  const now = useNow()
  const [text, disabledTags] = useStore(
    filterStore,
    useShallow((state) => [state.text, state.disabledTags]),
  )

  const [viewId, showPastEvents, onlyBookmarked] = useSearch({
    strict: false,
    select: (state) => [state.view, state.past, state.bookmarked] as const,
    structuralSharing: true,
  })

  const selectedView = pageConfig.views
    ? pageConfig.views.find((c) => c.id == viewId)
    : undefined
  const defaultView = pageConfig.views ? pageConfig.views[0] : undefined
  // const viewConfig = selectedView ?? defaultView

  const viewOptions = useMemo(() => {
    return iterToArr(pageConfig.views).map((c) => ({
      value: c.id,
      label: c.title,
    }))
  }, [pageConfig.views])

  const pageFilteredItems = usePageFilteredItems(pageConfig, items ?? [])

  const relevantTags = useRelevantTags(config.tags, pageFilteredItems)

  const days = useMemo(
    () =>
      getDays(
        [...pageFilteredItems].filter(
          (d): d is typeof d & { readonly start: Date } => !!d.start,
        ),
        config.dayChangeHour,
      ),
    [pageFilteredItems, config.dayChangeHour],
  )

  const ssels = useSessionSelectionsIfEnabled(onlyBookmarked)

  const filteredItems = useFilteredItems(pageFilteredItems, {
    now,
    disabledTags,
    onlyBookmarked,
    showPastEvents,
    text,
    selections: ssels,
  })

  return (
    <Box className={clsx("Page-root", classes.root)}>
      <Markdown className={clsx("Page-description", classes.description)}>
        {pageConfig.description}
      </Markdown>
      <SchedulePage
        {...other}
        viewOptions={viewOptions}
        hideShowPastEventsFilter={pageConfig.noPastEventsOption}
        renderBookmarkFilter={(props) => <BookmarkFilterContainer {...props} />}
        renderViewSelect={(props) => (
          <ViewSelectContainer
            value={selectedView?.id ?? defaultView?.id}
            {...props}
          />
        )}
        renderTextFilter={(props) => <TextFilterContainer {...props} />}
        renderPastEventsFilter={(props) => (
          <PastEventsFilterContainer {...props} />
        )}
        renderTagFilter={(props) => (
          <TagFilterContainer tags={relevantTags} {...props} />
        )}
        // TODO: configurable share options
        renderShare={(props) => <ShareMenu {...props} />}
        renderSchedule={(props) => (
          <ScheduleContainer
            {...props}
            items={filteredItems}
            days={days}
            pageConfig={pageConfig}
            viewConfig={selectedView}
            origin={origin}
            currentURL={currentURL}
          />
        )}
      />
    </Box>
  )
}

type ViewConfigProps = DailyAgendaViewProps &
  FullAgendaViewProps &
  CatalogViewProps &
  TagsViewProps

const ScheduleContainer = (props: {
  items: Iterable<DetailedScheduleItem>
  days?: Iterable<Day>
  viewConfig?: ViewConfig
  pageConfig: PageConfig
  origin: string
  currentURL: string
}) => {
  const { viewConfig, currentURL, origin, items, days = [] } = props

  const now = useNow()
  const config = useViewerConfig()
  const router = useRouter()
  const navigate = useNavigate()

  // TODO: reuse this logic?
  const selectedDayKey = useSearch({
    strict: false,
    select: (state) => state.day,
  })

  const defaultDay = useMemo(() => getDefaultDay(days, now), [days, now])
  const selectedDay = [...days].find((d) => d.key == selectedDayKey)

  const onSelectDay = useCallback(
    (day: Day) => {
      navigate({
        to: ".",
        params: true,
        state: true,
        hash: true,
        search: (cur) => ({
          ...cur,
          day: day.key,
        }),
        replace: true,
      })
    },
    [navigate],
  )

  const filterStore = useRequiredContext(FilterStateStoreContext)

  const [text, disabledTags] = useStore(
    filterStore,
    useShallow((state) => [state.text, state.disabledTags]),
  )
  const [showPastEvents, onlyBookmarked] = useSearch({
    strict: false,
    select: (state) => [state.past, state.bookmarked],
  })

  const ssels = useSessionSelectionsIfEnabled(onlyBookmarked)

  const filteredItems = useFilteredItems(items ?? [], {
    now,
    disabledTags,
    selections: ssels,
    showPastEvents,
    onlyBookmarked,
    text,
  })

  const locMatchFunc = useMapLocationMatchFunc(config.map?.locations)

  const navPropsMap = useMemo(
    () => makeItemNavPropsMap(router, origin, currentURL, locMatchFunc, items),
    [router, locMatchFunc, items],
  )

  const renderItemDetailsFunc = useMemo(
    () => makeRenderItemDetailsFunc(navPropsMap),
    [navPropsMap],
  )

  const tagIndicatorFunc = useMemo(
    () => makeTagIndicatorFunc(config.tagIndicators),
    [config.tagIndicators],
  )

  const renderPillFunc = useMemo(
    () =>
      makeRenderPillFunc(renderItemDetailsFunc, tagIndicatorFunc, navPropsMap),
    [renderItemDetailsFunc, tagIndicatorFunc, navPropsMap],
  )

  const renderItemPills = useCallback(
    (props: ItemPillsProps) => (
      <ItemPills {...props} renderPill={renderPillFunc} />
    ),
    [renderPillFunc],
  )

  const getDayHref = useCallback(
    (day: Day) => {
      return (
        origin +
        router.history.createHref(
          router.buildLocation({
            to: ".",
            params: true,
            state: true,
            hash: true,
            search: (cur) => ({
              ...cur,
              day: day.key,
            }),
          }).href,
        )
      )
    },
    [router],
  )

  const componentType = viewConfig?.type ?? "daily-agenda"

  const viewConfigProps: ViewConfigProps & Record<string, unknown> = {
    ...viewConfig,
    items: filteredItems,
    dayChangeHour: config.dayChangeHour,
    dayFormat: config.dayFormat,
    days,
    selectedDay: selectedDay ?? defaultDay,
    onSelectDay,
    getDayHref,
    now,
    tagIndicators: config.tagIndicators,
    tags: config.tags,
    renderItemPills,
  }

  return <Schedule {...viewConfigProps} type={componentType} />

  // return (
  //   <Schedule
  //     type={viewConfig?.type ?? "daily-agenda"}
  //     items={filteredItems}
  //     now={now}
  //     tags={config.tags}
  //     days={days}
  //     selectedDay={selectedDay ?? defaultDay}
  //     dayChangeHour={config.dayChangeHour}
  //     getDayHref={getDayHref}
  //     onSelectDay={onSelectDay}
  //     dayFormat={config.dayFormat}
  //     renderItemPills={renderItemPills}
  //   />
  // )
}
