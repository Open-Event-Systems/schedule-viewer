import {
  type Day,
  type DetailedScheduleItem,
  type ScheduleItemCollection,
} from "@open-event-systems/schedule-lib"
import {
  getEnabledScheduleViewTypes,
  getValidScheduleViewType,
  useViewerConfig,
  type PageConfig,
} from "../../config.js"
import { FilterStateStoreContext, usePageFilteredItems } from "../../filter.js"
import { useProps, type BoxProps } from "@mantine/core"
import {
  BookmarkFilter,
  Filter,
  makeTagIndicatorFunc,
  Markdown,
  Schedule,
  SchedulePage,
  TagFilter,
  useFilteredItems,
  useRelevantTags,
  type ScheduleViewType,
  type TagEntry,
} from "@open-event-systems/schedule-react"
import { useCallback, useMemo, type ChangeEvent } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"

import classes from "./page.module.scss"
import clsx from "clsx"
import { useNow, useRequiredContext } from "../../utils.js"
import {
  makeItemNavPropsMap,
  makeRenderItemDetailsFunc,
  makeRenderPillFunc,
} from "../../schedule.js"
import { useMapLocationMatchFunc } from "@open-event-systems/schedule-map"
import { pagesRoute } from "../../routes.js"
import { useSessionSelectionsIfEnabled } from "../../filter.js"
import { useStore } from "zustand"

declare module "@tanstack/react-router" {
  interface HistoryState {
    scheduleViewType?: ScheduleViewType
  }
}

export type PageProps = {
  items: ScheduleItemCollection<DetailedScheduleItem>
  pageConfig: PageConfig
  origin: string
  currentURL: string
} & BoxProps

export const Page = (props: PageProps) => {
  const { items, pageConfig, origin, currentURL } = useProps("Page", {}, props)

  const config = useViewerConfig()
  const { tags } = config
  const router = useRouter()
  const navigate = useNavigate()
  const {
    day: selectedDayKey,
    view: scheduleViewType,
    bookmarked: onlyBookmarked,
    past: showPastEvents,
  } = pagesRoute.useSearch()
  const now = useNow()

  const filterStateStore = useRequiredContext(FilterStateStoreContext)

  const text = useStore(filterStateStore, (state) => state.text)
  const disabledTags = useStore(filterStateStore, (state) => state.disabledTags)

  const ssels = useSessionSelectionsIfEnabled(onlyBookmarked)

  const pageFilteredItems = usePageFilteredItems(items, pageConfig)

  const relevantTags = useRelevantTags(tags, pageFilteredItems)
  const locMatchFunc = useMapLocationMatchFunc(config.map?.locations)

  const navPropsMap = useMemo(
    () =>
      makeItemNavPropsMap(
        router,
        origin,
        currentURL,
        locMatchFunc,
        pageFilteredItems,
      ),
    [router, locMatchFunc, pageFilteredItems],
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

  const filteredItems = useFilteredItems(pageFilteredItems, {
    now,
    text,
    disabledTags,
    selections: ssels?.selections,
    showPastEvents,
    onlyBookmarked,
  })

  const enabledViewTypes = useMemo(
    () => getEnabledScheduleViewTypes(pageConfig.enabledViews),
    [pageConfig.enabledViews],
  )
  const validatedSelectedType = useMemo(
    () => getValidScheduleViewType(pageConfig.enabledViews, scheduleViewType),
    [pageConfig.enabledViews, scheduleViewType],
  )

  const setViewType = useCallback(
    (type?: ScheduleViewType) => {
      navigate({
        to: pagesRoute.to,
        params: {
          pageId: pageConfig.id,
        },
        search: (prev) => {
          return {
            ...prev,
            view: type,
          }
        },
        replace: true,
      })
    },
    [navigate, pageConfig.id],
  )

  const setSelectedDay = useCallback(
    (day: Day) => {
      navigate({
        to: pagesRoute.to,
        params: {
          pageId: pageConfig.id,
        },
        search: (prev) => {
          return {
            ...prev,
            day: day.key,
          }
        },
        replace: true,
      })
    },
    [navigate, pageConfig.id],
  )

  const setOnlyBookmarked = useCallback(
    (onlyBookmarked?: boolean) => {
      navigate({
        to: pagesRoute.to,
        params: {
          pageId: pageConfig.id,
        },
        search: (prev) => {
          return {
            ...prev,
            bookmarked: onlyBookmarked,
          }
        },
        replace: true,
      })
    },
    [navigate, pageConfig.id],
  )

  return (
    <>
      {pageConfig.description && (
        <Markdown className={clsx("Page-description", classes.description)}>
          {pageConfig.description}
        </Markdown>
      )}
      <SchedulePage
        filteredItems={filteredItems}
        type={validatedSelectedType}
        allowTypes={enabledViewTypes}
        onChangeType={setViewType}
        filter={
          <WrappedFilter relevantTags={relevantTags} pageConfig={pageConfig} />
        }
        bookmarkFilter={
          <BookmarkFilter value={onlyBookmarked} onChange={setOnlyBookmarked} />
        }
        schedule={
          <Schedule
            filteredItems={filteredItems}
            items={items}
            renderPill={renderPillFunc}
            type={validatedSelectedType}
            selectedDayKey={selectedDayKey}
            onSelectDay={setSelectedDay}
            binTitleComponent={scheduleViewType == "full-agenda" ? "h3" : "h2"}
            dayTitleComponent="h2"
          />
        }
      />
    </>
  )
}

const WrappedFilter = ({
  relevantTags,
  pageConfig,
}: {
  relevantTags: Iterable<TagEntry>
  pageConfig: PageConfig
}) => {
  const config = useViewerConfig()
  const { past: showPastEvents } = pagesRoute.useSearch()
  const navigate = useNavigate()

  const setShowPastEvents = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      navigate({
        to: pagesRoute.to,
        params: {
          pageId: pageConfig.id,
        },
        search: (prev) => {
          return {
            ...prev,
            past: e.target.checked,
          }
        },
        replace: true,
      })
    },
    [navigate, pageConfig.id],
  )

  const filterStateStore = useRequiredContext(FilterStateStoreContext)
  const text = useStore(filterStateStore, (state) => state.text)
  const disabledTags = useStore(filterStateStore, (state) => state.disabledTags)
  const setText = useStore(filterStateStore, (state) => state.setText)
  const setTagDisabled = useStore(
    filterStateStore,
    (state) => state.setTagDisabled,
  )

  return (
    <Filter
      text={
        <Filter.Text value={text} onChange={(e) => setText(e.target.value)} />
      }
      pastEvents={
        <Filter.PastEvents
          checked={!!showPastEvents}
          onChange={setShowPastEvents}
        />
      }
      tagFilter={
        <TagFilter
          tags={relevantTags}
          tagIndicators={config.tagIndicators}
          disabledTags={disabledTags}
          onSetDisabled={setTagDisabled}
        />
      }
    />
  )
}
