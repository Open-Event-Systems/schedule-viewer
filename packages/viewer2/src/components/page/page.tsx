import {
  getDays,
  getDefaultDay,
  makeScheduleItemCollection,
  type Day,
  type DetailedScheduleItem,
  type ScheduleItemCollection,
} from "@open-event-systems/schedule-lib"
import {
  makeRequireTagsFilter,
  makeTypeFilter,
  useViewerConfig,
  type PageConfig,
} from "../../config.js"
import { useProps, type BoxProps } from "@mantine/core"
import {
  BookmarkFilter,
  Filter,
  makeTagIndicatorFunc,
  Markdown,
  Schedule,
  SchedulePage,
  selectionsQueryOptions,
  TagFilter,
  useBookmarkCounts,
  useFilteredItems,
  useRelevantTags,
  useSelectionsAPI,
  type ScheduleType,
  type TagEntry,
} from "@open-event-systems/schedule-react"
import { use, useCallback, useEffect, useMemo, type ChangeEvent } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import classes from "./page.module.scss"
import clsx from "clsx"
import { useNow } from "../../utils.js"
import {
  makeItemNavPropsMap,
  makeRenderItemDetailsFunc,
  makeRenderPillFunc,
} from "../../schedule.js"
import { makeMapLocationMatchFunc } from "@open-event-systems/schedule-map"
import { pagesRoute } from "../../routes.js"
import { FilterStateAtomContext } from "../../filter.js"
import { useAtom } from "jotai"

declare module "@tanstack/react-router" {
  interface HistoryState {
    scheduleViewType?: ScheduleType
  }
}

export type PageProps = {
  items: ScheduleItemCollection<DetailedScheduleItem>
  pageConfig: PageConfig
} & BoxProps

export const Page = (props: PageProps) => {
  const { items, pageConfig } = useProps("Page", {}, props)

  const config = useViewerConfig()
  const { tags } = config
  const api = useSelectionsAPI()
  const router = useRouter()
  const navigate = useNavigate()
  const {
    day: selectedDayKey,
    view: scheduleViewType,
    bookmarked: onlyBookmarked,
    past: showPastEvents,
  } = pagesRoute.useSearch()
  const now = useNow()

  const filterStateAtom = use(FilterStateAtomContext)
  const [filterState] = useAtom(filterStateAtom)
  const [text] = useAtom(filterState.text)
  const [disabledTags] = useAtom(filterState.disabledTags)

  const query = useSuspenseQuery({
    ...selectionsQueryOptions.sessionSelections(api, config.id, "bookmarks"),
    // subscribed: false,
  })

  const counts = useBookmarkCounts()

  const ssels = query.data

  const pageFilteredItems = useMemo(() => {
    const typeFilter = makeTypeFilter(pageConfig.onlyType)
    const reqTagsFilter = makeRequireTagsFilter(pageConfig.requireTags)

    const byType = makeScheduleItemCollection(items.filter(typeFilter))
    const byReqTags = makeScheduleItemCollection(byType.filter(reqTagsFilter))
    return byReqTags
  }, [items, pageConfig])

  const relevantTags = useRelevantTags(tags, pageFilteredItems)

  const locMatchFunc = useMemo(
    () => makeMapLocationMatchFunc(config.map?.locations ?? []),
    [config.map?.locations],
  )

  const navPropsMap = useMemo(
    () => makeItemNavPropsMap(router, locMatchFunc, pageFilteredItems),
    [router, locMatchFunc, pageFilteredItems],
  )

  const renderItemDetailsFunc = useMemo(
    () => makeRenderItemDetailsFunc(navPropsMap),
    [ssels.selections, counts, navPropsMap],
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
    selections: ssels.selections,
    showPastEvents,
    onlyBookmarked,
  })

  const allowedTypes = [...(pageConfig.enabledViews ?? [])] as ScheduleType[]
  const validatedSelectedType =
    scheduleViewType && allowedTypes.includes(scheduleViewType)
      ? scheduleViewType
      : allowedTypes[0]

  const setViewType = useCallback(
    (type?: ScheduleType) => {
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

  // auto set default day
  useEffect(() => {
    if (selectedDayKey) {
      return
    }

    const days = getDays(
      items.filter(
        (it): it is typeof it & { readonly start: Date } => !!it.start,
      ),
      config.dayChangeHour,
    )

    const curDay = getDefaultDay(days, now)

    if (curDay?.key) {
      navigate({
        to: pagesRoute.to,
        params: {
          pageId: pageConfig.id,
        },
        search: (prev) => {
          return {
            ...prev,
            day: curDay.key,
          }
        },
        state: (prev) => prev,
        hash: (prev) => prev ?? "",
        replace: true,
      })
    }
  }, [
    selectedDayKey,
    now,
    config.dayChangeHour,
    items,
    navigate,
    pageConfig.id,
  ])

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
        allowTypes={pageConfig.enabledViews as ScheduleType[] | undefined}
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

  const filterAtom = use(FilterStateAtomContext)
  const [filterState] = useAtom(filterAtom)
  const [text, setText] = useAtom(filterState.text)
  const [disabledTags, setDisabledTags] = useAtom(filterState.disabledTags)

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
          onSetDisabled={(tag, disabled) => {
            setDisabledTags((prev) => {
              const newSet = new Set(prev)
              if (disabled) {
                newSet.add(tag)
              } else {
                newSet.delete(tag)
              }

              return newSet
            })
          }}
        />
      }
    />
  )
}
