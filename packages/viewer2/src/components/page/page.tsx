import {
  getDays,
  getDefaultDay,
  makeScheduleItemCollection,
  type Day,
  type DetailedScheduleItem,
  type ScheduleItemCollection,
} from "@open-event-systems/schedule-lib"
import { useViewerConfig, type PageConfig } from "../../config.js"
import { FilterStateStoreContext, usePageFilteredItems } from "../../filter.js"
import { Box, useProps } from "@mantine/core"
import {
  makeTagIndicatorFunc,
  Markdown,
  Schedule,
  SchedulePage,
  scheduleViewTypes,
  ShareMenu,
  useFilteredItems,
  useRelevantTags,
  type SchedulePageProps,
  type ScheduleProps,
  type ScheduleViewType,
} from "@open-event-systems/schedule-react"
import { useCallback, useMemo } from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"

import { useNow, useRequiredContext } from "../../utils.js"
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

declare module "@tanstack/react-router" {
  interface HistoryState {
    scheduleViewType?: ScheduleViewType
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
  const [showPastEvents, onlyBookmarked] = useSearch({
    strict: false,
    select: (state) => [state.past, state.bookmarked],
  })

  const pageFilteredItems = usePageFilteredItems(pageConfig, items)

  const relevantTags = useRelevantTags(config.tags, pageFilteredItems)

  const ssels = useSessionSelectionsIfEnabled(onlyBookmarked)

  const filteredItems = useFilteredItems(pageFilteredItems, {
    now,
    disabledTags,
    onlyBookmarked,
    showPastEvents,
    text,
    selections: ssels?.selections,
  })

  return (
    <Box className={clsx("Page-root", classes.root)}>
      <Markdown className={clsx("Page-description", classes.description)}>
        {pageConfig.description}
      </Markdown>
      <SchedulePage
        {...other}
        allowTypes={pageConfig.enabledViews}
        hideShowPastEventsFilter={pageConfig.noPastEventsOption}
        renderBookmarkFilter={(props) => <BookmarkFilterContainer {...props} />}
        renderViewSelect={(props) => (
          <ViewSelectContainer {...props} pageConfig={pageConfig} />
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
            pageConfig={pageConfig}
            origin={origin}
            currentURL={currentURL}
            items={pageFilteredItems}
            filteredItems={filteredItems}
          />
        )}
      />
    </Box>
  )
}

const ScheduleContainer = (
  props: ScheduleProps & {
    pageConfig: PageConfig
    origin: string
    currentURL: string
  },
) => {
  const {
    pageConfig,
    currentURL,
    origin,
    items = makeScheduleItemCollection(),
    ...other
  } = props

  const now = useNow()
  const config = useViewerConfig()
  const router = useRouter()
  const navigate = useNavigate()

  // TODO: reuse this logic?
  const viewType = useSearch({ strict: false, select: (state) => state.view })
  const allowedTypes = pageConfig.enabledViews ?? scheduleViewTypes
  const selectedType =
    viewType && allowedTypes.includes(viewType)
      ? viewType
      : (allowedTypes[0] ?? scheduleViewTypes[0])

  // TODO: reuse this logic?
  const selectedDayKey = useSearch({
    strict: false,
    select: (state) => state.day,
  })

  const days = useMemo(
    () =>
      getDays(
        items
          ? items.filter((d): d is typeof d & { start: Date } => !!d.start)
          : [],
        config.dayChangeHour,
      ),
    [items, config.dayChangeHour],
  )

  const defaultDay = useMemo(() => getDefaultDay(days, now), [days, now])
  const validSelectedDay =
    selectedDayKey && days.some((d) => d.key == selectedDayKey)
      ? selectedDayKey
      : defaultDay?.key

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

  const filteredItems = useFilteredItems(items, {
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

  return (
    <Schedule
      {...other}
      items={items}
      dayTitleComponent="h2"
      renderBinTitle={(props) =>
        selectedType == "full-agenda" ? <h3 {...props} /> : <h2 {...props} />
      }
      filteredItems={filteredItems}
      now={now}
      type={selectedType}
      selectedDayKey={validSelectedDay}
      getDayHref={getDayHref}
      onSelectDay={onSelectDay}
      renderPill={renderPillFunc}
    />
  )
}
