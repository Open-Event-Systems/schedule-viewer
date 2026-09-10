import { SchedulePage } from "@open-event-systems/schedule-react"
import {
  PastEventsFilterContainer,
  SelectionsFilterContainer,
  TagFilterContainer,
  TextFilterContainer,
} from "../../../../components/filter-state/filter-state.js"
import { useScheduleItems } from "../../../../hooks/schedule.js"
import {
  FilterDialogStoreContext,
  useCreateFilterDialogStore,
  useFilterDialogOpenState,
  useSyncFilterDialogState,
} from "../../../../hooks/filter-dialog.js"
import { useCallback } from "react"

export const SchedulePageRoute = () => {
  const filterDialogStore = useCreateFilterDialogStore()

  return (
    <FilterDialogStoreContext.Provider value={filterDialogStore}>
      <SchedulePageContainer />
    </FilterDialogStoreContext.Provider>
  )
}

const SchedulePageContainer = () => {
  const [filterDialogOpen, setFilterDialogOpen] = useFilterDialogOpenState()

  const openFilterDialog = useCallback(
    () => setFilterDialogOpen(true),
    [setFilterDialogOpen],
  )
  const closeFilterDialog = useCallback(
    () => setFilterDialogOpen(false),
    [setFilterDialogOpen],
  )

  const items = useScheduleItems()

  useSyncFilterDialogState(filterDialogOpen)

  return (
    <>
      Items len: {items.length}
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
