import { iterToArr, iterToSet } from "@open-event-systems/schedule-lib"
import type { SchedulePageFeature } from "./schedule-page.js"
import type { ViewSelectProps } from "../view-select/view-select.js"
import type { TagFilterTagData } from "../filters/tag-filter.js"
import type { SelectionsFilterOption } from "../filters/selections-filter.js"
import type { ShareMenuOption } from "../share-menu/share-menu.js"

export type UseSchedulePageFeaturesOptions = {
  enabledFeatures?: Iterable<SchedulePageFeature>
  viewSelectOptions?: ViewSelectProps["data"]
  tags?: Iterable<string | TagFilterTagData>
}

export type UseSchedulePageFeaturesValue = {
  showViewSelect: boolean
  showSelectionsFilter: boolean
  showSearch: boolean
  showPastEventsFilter: boolean
  showTagFilter: boolean
  showShareMenu: boolean
  shareMenuOptions: ReadonlySet<ShareMenuOption>
  selectionsFilterOptions: ReadonlySet<SelectionsFilterOption>
}

export const useSchedulePageFeatures = ({
  enabledFeatures,
  viewSelectOptions,
  tags,
}: UseSchedulePageFeaturesOptions): UseSchedulePageFeaturesValue => {
  const feats = iterToSet(enabledFeatures)
  const tagArr = iterToArr(tags)

  const showViewSelect = !!viewSelectOptions && viewSelectOptions.length > 1
  const showSelectionsFilter =
    feats.has("bookmarked-filter") || feats.has("unvisited-filter")
  const showSearch = feats.has("search")
  const showPastEventsFilter = feats.has("past-events-filter")
  const showTagFilter = tagArr.length > 0 && feats.has("tag-filter")
  const showShareMenu =
    feats.has("share") || feats.has("sync") || feats.has("export")

  const selectionsFilterOptions = new Set<SelectionsFilterOption>()

  if (feats.has("bookmarked-filter")) {
    selectionsFilterOptions.add("bookmarked")
  }

  if (feats.has("unvisited-filter")) {
    selectionsFilterOptions.add("unvisited")
  }

  const shareMenuOptions = new Set<ShareMenuOption>()

  if (feats.has("export")) {
    shareMenuOptions.add("export")
  }

  if (feats.has("share")) {
    shareMenuOptions.add("share")
  }

  if (feats.has("sync")) {
    shareMenuOptions.add("sync")
  }

  return {
    showViewSelect,
    showSelectionsFilter,
    showSearch,
    showPastEventsFilter,
    showTagFilter,
    showShareMenu,
    shareMenuOptions,
    selectionsFilterOptions,
  }
}
