import type { SelectionsFilterOption } from "@open-event-systems/schedule-react"
import { scheduleProvidersRoute } from "../../routes.js"
import type { ViewConfig } from "../../types.js"
import { useNow, useRequiredContext } from "../../utils.js"
import { FilterStateStoreContext } from "../../filter.js"
import { useShallow } from "zustand/react/shallow"
import { useStore } from "zustand"
import { useMemo } from "react"

export const useFilterOptions = (
  viewConfig: ViewConfig,
  hasSharedSelections = false,
): {
  disabledTags: ReadonlySet<string>
  text: string
  now: Date
  selectionsFilterOptions: readonly SelectionsFilterOption[]
  showPastEvents: boolean
} => {
  const [optShowPastEvents, optOnlyBookmarked, optOnlyUnvisited] =
    scheduleProvidersRoute.useSearch({
      select: (state) =>
        [state.past, state.bookmarked, state.unvisited] as const,
      structuralSharing: true,
    })

  const filterStore = useRequiredContext(FilterStateStoreContext)

  const [text, disabledTags] = useStore(
    filterStore,
    useShallow((state) => [state.text, state.disabledTags]),
  )

  // onlyBookmarked is enforced if viewing a shared schedule
  const onlyBookmarked =
    !!hasSharedSelections || (viewConfig.onlyBookmarked ?? optOnlyBookmarked)
  const onlyUnvisited = viewConfig.onlyUnvisited ?? optOnlyUnvisited
  const showPastEvents = viewConfig.showPastEvents ?? optShowPastEvents

  const selectionsFilterOptions = useMemo(() => {
    const selectionsFilterOptions: SelectionsFilterOption[] = []

    if (onlyBookmarked) {
      selectionsFilterOptions.push("bookmarked")
    }

    if (onlyUnvisited) {
      selectionsFilterOptions.push("unvisited")
    }

    return selectionsFilterOptions
  }, [onlyBookmarked, onlyUnvisited])

  const now = useNow()

  return {
    disabledTags,
    text,
    now,
    selectionsFilterOptions,
    showPastEvents: !!showPastEvents,
  }
}
