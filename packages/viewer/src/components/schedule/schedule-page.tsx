import {
  filterItems,
  SchedulePage,
  schedulePageFeatures,
  sessionSelectionsQueryOptions,
  ShareMenu,
  useRelevantTags,
  useSelectionsServiceAvailable,
  useSessionSelectionsAPI,
  type ShareMenuOption,
  type ShareMenuProps,
} from "@open-event-systems/schedule-react"
import { useViewerConfig } from "../../config.js"
import {
  iterToArr,
  type DetailedScheduleItem,
} from "@open-event-systems/schedule-lib"
import { usePageFilteredItems } from "../../filter.js"
import {
  SelectionsFilterContainer,
  PastEventsFilterContainer,
  TagFilterContainer,
  TextFilterContainer,
  ViewSelectContainer,
} from "../filters/filters.js"
import { ScheduleContainer } from "./schedule.js"
import { scheduleProvidersRoute } from "../../routes.js"
import { notFound } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"
import type { PageConfig, ViewConfig } from "../../types.js"
import { useFilterOptions } from "./hooks.js"
import { useQueryClient } from "@tanstack/react-query"

export type SchedulePageContainerProps = {
  items?: Iterable<DetailedScheduleItem>
  pageConfig: PageConfig
  onSelectShareOption?: (
    option: ShareMenuOption,
    items: Iterable<DetailedScheduleItem>,
  ) => void
  sharedSelections?: Iterable<string>
}

/**
 * Wraps {@link SchedulePage} to handle business logic.
 */
export const SchedulePageContainer = (props: SchedulePageContainerProps) => {
  const { items, pageConfig, onSelectShareOption, sharedSelections } = props

  const config = useViewerConfig()
  const getCurrentURL = scheduleProvidersRoute.useRouteContext({
    select: (ctx) => ctx.getCurrentURL,
  })

  // params

  const selectedViewId = scheduleProvidersRoute.useSearch({
    select: (params) => params.view,
  })

  // View options and features

  const [viewConfig, defaultViewConfig] = useMemo(() => {
    const viewsArr = iterToArr(pageConfig.views)
    const viewConfig = viewsArr.find((v) => v.id == selectedViewId)
    const defaultViewConfig = viewsArr[0]
    return [viewConfig ?? defaultViewConfig, defaultViewConfig]
  }, [selectedViewId, pageConfig.views])

  if (!viewConfig) {
    throw notFound()
  }

  const viewOpts = useMemo(
    () =>
      pageConfig.views?.map((c) => ({
        label: c.title,
        value: c.id,
      })) ?? [],
    [pageConfig.views],
  )

  const selectionsServiceAvailable = useSelectionsServiceAvailable()

  const enableFeatures = useMemo(() => {
    let features = [...(viewConfig.enableFeatures ?? schedulePageFeatures)]

    // hide share/sync options if selections service is unavailable
    if (!selectionsServiceAvailable) {
      features = features.filter((f) => f != "share" && f != "sync")
    }

    // hide bookmark/visited filters for shared schedules
    if (sharedSelections) {
      features = features.filter(
        (f) => f != "bookmarked-filter" && f != "unvisited-filter",
      )
    }

    return features
  }, [viewConfig.enableFeatures, selectionsServiceAvailable, sharedSelections])

  // Items and tags

  const pageItems = usePageFilteredItems(pageConfig, items)
  const relevantTags = useRelevantTags(config.tags, pageItems)

  return (
    <SchedulePage
      tags={relevantTags}
      viewOptions={viewOpts}
      enableFeatures={enableFeatures}
      renderSelectionsFilter={(props) => (
        <SelectionsFilterContainer {...props} />
      )}
      renderViewSelect={(props) => (
        <ViewSelectContainer
          defaultValue={defaultViewConfig?.id}
          value={viewConfig.id}
          {...props}
        />
      )}
      renderTextFilter={(props) => <TextFilterContainer {...props} />}
      renderPastEventsFilter={(props) => (
        <PastEventsFilterContainer {...props} />
      )}
      renderTagFilter={(props) => <TagFilterContainer {...props} />}
      renderShare={(props) => (
        <ShareMenuContainer
          {...props}
          viewConfig={viewConfig}
          items={pageItems}
          sharedSelections={sharedSelections}
          onSelect={onSelectShareOption}
        />
      )}
      renderSchedule={() => (
        <ScheduleContainer
          viewConfig={viewConfig}
          getCurrentURL={getCurrentURL}
          items={pageItems}
          tags={relevantTags}
          sharedSelections={sharedSelections}
        />
      )}
    />
  )
}

const ShareMenuContainer = (
  props: Omit<ShareMenuProps, "onSelect"> & {
    viewConfig: ViewConfig
    items?: Iterable<DetailedScheduleItem>
    sharedSelections?: Iterable<string>
    onSelect?: (
      option: ShareMenuOption,
      items: Iterable<DetailedScheduleItem>,
    ) => void
  },
) => {
  const { viewConfig, items, sharedSelections, onSelect, ...other } = props

  const config = useViewerConfig()
  const options = useFilterOptions(viewConfig, !!sharedSelections)
  const bookmarksAPI = useSessionSelectionsAPI("bookmarks")
  const visitedAPI = useSessionSelectionsAPI("visited")
  const queryClient = useQueryClient()

  const wrappedOnSelect = useCallback(
    (opt: ShareMenuOption) => {
      const bookmarked = queryClient.getQueryData(
        sessionSelectionsQueryOptions.sessionSelections(
          bookmarksAPI,
          config.id,
          "bookmarks",
        ).queryKey,
      )
      const visited = queryClient.getQueryData(
        sessionSelectionsQueryOptions.sessionSelections(
          visitedAPI,
          config.id,
          "visited",
        ).queryKey,
      )

      const filtered = filterItems(items, {
        disabledTags: options.disabledTags,
        now: options.now,
        selectionsFilterOptions: options.selectionsFilterOptions,
        showPastEvents: options.showPastEvents,
        text: options.text,
        bookmarked,
        visited,
      })

      onSelect && onSelect(opt, filtered)
    },
    [
      config,
      bookmarksAPI,
      visitedAPI,
      queryClient,
      onSelect,
      items,
      options.disabledTags,
      options.now,
      options.selectionsFilterOptions,
      options.showPastEvents,
      options.text,
    ],
  )

  return <ShareMenu onSelect={wrappedOnSelect} {...other} />
}
