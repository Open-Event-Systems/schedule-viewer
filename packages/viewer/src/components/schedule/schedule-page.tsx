import {
  SchedulePage,
  schedulePageFeatures,
  ShareMenu,
  useRelevantTags,
  useSelectionsServiceAvailable,
  type ShareMenuOption,
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
import type { PageConfig } from "../../types.js"

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
    const features = [...(viewConfig.enableFeatures ?? schedulePageFeatures)]

    // hide share/sync options if selections service is unavailable
    if (!selectionsServiceAvailable) {
      return features.filter((f) => f != "share" && f != "sync")
    } else {
      return features
    }
  }, [viewConfig.enableFeatures, selectionsServiceAvailable])

  // Items and tags

  const pageItems = usePageFilteredItems(pageConfig, items)

  const relevantTags = useRelevantTags(config.tags, pageItems)

  const wrappedOnSelectShareOption = useCallback(
    (option: ShareMenuOption) => {
      if (onSelectShareOption) {
        onSelectShareOption(option, pageItems ?? [])
      }
    },
    [pageItems, onSelectShareOption],
  )

  return (
    <SchedulePage
      tags={relevantTags}
      viewOptions={viewOpts}
      enableFeatures={enableFeatures}
      renderSelectionsFilter={(props) => (
        <SelectionsFilterContainer {...props} />
      )}
      renderViewSelect={(props) => (
        <ViewSelectContainer defaultValue={defaultViewConfig?.id} {...props} />
      )}
      renderTextFilter={(props) => <TextFilterContainer {...props} />}
      renderPastEventsFilter={(props) => (
        <PastEventsFilterContainer {...props} />
      )}
      renderTagFilter={(props) => <TagFilterContainer {...props} />}
      renderShare={(props) => (
        <ShareMenu {...props} onSelect={wrappedOnSelectShareOption} />
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
