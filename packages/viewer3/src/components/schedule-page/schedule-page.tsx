import {
  PastEventsFilterContainer,
  SelectionsFilterContainer,
  TagFilterContainer,
  TextFilterContainer,
} from "#src/components/filter-state/filter-state.js"
import { useFilterDialogOpenState } from "#src/hooks/filter-dialog.js"
import { useSyncFilterDialogState } from "#src/hooks/filter-location-state.js"
import { SchedulePage } from "@open-event-systems/schedule-react"
import { useCallback } from "react"

export const SchedulePageContainer = () => {
  const [filterDialogOpen, setFilterDialogOpen] = useFilterDialogOpenState()

  const openFilterDialog = useCallback(
    () => setFilterDialogOpen(true),
    [setFilterDialogOpen],
  )
  const closeFilterDialog = useCallback(
    () => setFilterDialogOpen(false),
    [setFilterDialogOpen],
  )

  useSyncFilterDialogState(filterDialogOpen)

  return (
    <>
      <SchedulePage
        filterDialogOpen={filterDialogOpen}
        onOpenFilterDialog={openFilterDialog}
        onCloseFilterDialog={closeFilterDialog}
        enabledFeatures={[
          "bookmarked-filter",
          "unvisited-filter",
          "search",
          "past-events-filter",
          "tag-filter",
          "export",
          "share",
          "sync",
        ]}
        tags={[
          {
            value: "main-event",
            label: "Main Event",
          },
          {
            value: "photography",
            label: "Photography",
          },
        ]}
        renderSelectionsFilter={(props) => (
          <SelectionsFilterContainer {...props} />
        )}
        textFilter={<TextFilterContainer />}
        pastEventsFilter={<PastEventsFilterContainer />}
        renderTagFilter={(props) => <TagFilterContainer {...props} />}
      />
    </>
  )
}
