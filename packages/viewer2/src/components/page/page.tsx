import {
  getDays,
  getDefaultDay,
  type ScheduleItemStore,
} from "@open-event-systems/schedule-lib"
import {
  makeRequireTagsFilter,
  makeTypeFilter,
  useViewerConfig,
  type PageConfig,
} from "../../config.js"
import { useProps, type BoxProps } from "@mantine/core"
import {
  FilterContext,
  Markdown,
  SchedulePage,
  selectionsQueryFns,
  selectionsQueryKeys,
  useFilteredItems,
  useRelevantTags,
  useSelectionsAPI,
  type ScheduleType,
} from "@open-event-systems/schedule-react"
import { use, useEffect, useMemo } from "react"
import { useRouter } from "@tanstack/react-router"
import {
  CachedItemPropsContext,
  makeCachedItemPropsMap,
  useRenderPillFunc,
} from "../../schedule.js"
import { useSuspenseQuery } from "@tanstack/react-query"

import classes from "./page.module.scss"
import clsx from "clsx"
import { ViewTypeContext } from "../../routes/filter-state.js"

declare module "@tanstack/react-router" {
  interface HistoryState {
    scheduleViewType?: ScheduleType
  }
}

export type PageProps = {
  items: ScheduleItemStore
  pageConfig: PageConfig
} & BoxProps

export const Page = (props: PageProps) => {
  const { items, pageConfig } = useProps("Page", {}, props)

  const config = useViewerConfig()
  const { tags } = config
  const api = useSelectionsAPI()

  const pageFilteredItems = useMemo(() => {
    const typeFilter = makeTypeFilter(pageConfig.onlyType)
    const reqTagsFilter = makeRequireTagsFilter(pageConfig.requireTags)

    return items.filter(typeFilter).filter(reqTagsFilter)
  }, [items, pageConfig])

  const router = useRouter()

  const [scheduleViewType, setViewType] = use(ViewTypeContext)
  const [filterSettings, setFilterSettings] = use(FilterContext)

  const navPropsMap = useMemo(
    () =>
      makeCachedItemPropsMap(router, pageFilteredItems, config.tagIndicators),
    [router, pageFilteredItems],
  )

  const relevantTags = useRelevantTags(tags, pageFilteredItems)

  const query = useSuspenseQuery({
    queryKey: selectionsQueryKeys.sessionSelections(config.id, "bookmarks"),
    queryFn: selectionsQueryFns.sessionSelections(api, "bookmarks"),
    staleTime: 120000,
    subscribed: false,
  })
  const ssels = query.data

  const renderPill = useRenderPillFunc()

  const now = new Date()
  const filteredItems = useFilteredItems(
    pageFilteredItems,
    now,
    ssels.selections,
  )

  const allowedTypes = [...(pageConfig.enabledViews ?? [])] as ScheduleType[]
  const validatedSelectedType =
    scheduleViewType && allowedTypes.includes(scheduleViewType)
      ? scheduleViewType
      : allowedTypes[0]

  // auto set default day
  useEffect(() => {
    if (filterSettings.selectedDayKey) {
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
      setFilterSettings({ selectedDayKey: days[0]?.key })
    }
  }, [
    filterSettings.selectedDayKey,
    now,
    config.dayChangeHour,
    items,
    setFilterSettings,
  ])

  return (
    <CachedItemPropsContext value={navPropsMap}>
      {pageConfig.description && (
        <Markdown className={clsx("Page-description", classes.description)}>
          {pageConfig.description}
        </Markdown>
      )}
      <SchedulePage
        items={pageFilteredItems}
        filteredItems={filteredItems}
        renderPill={renderPill}
        tags={relevantTags}
        type={validatedSelectedType}
        noPastEventsOption={pageConfig.noPastEventsOption}
        allowTypes={pageConfig.enabledViews as ScheduleType[] | undefined}
        onChangeType={setViewType}
      />
    </CachedItemPropsContext>
  )
}
