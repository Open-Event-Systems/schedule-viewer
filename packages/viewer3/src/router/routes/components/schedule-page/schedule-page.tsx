import { useFilterDialogOpenState } from "#src/hooks/filter-dialog.js"
import {
  LocationFilterActionsContext,
  useMakeLocationFilterActions,
  useSyncFilterDialogState,
} from "#src/hooks/filter-location-state.js"
import {
  FilterStoreContext,
  SchedulePage,
  useCreateFilterStore,
} from "@open-event-systems/schedule-react"
import { useCallback } from "react"
import {
  PastEventsFilterContainer,
  SelectionsFilterContainer,
  TagFilterContainer,
  TextFilterContainer,
} from "../../../../components/filter-state/filter-state.js"
import { useScheduleItems } from "../../../../hooks/schedule.js"

export const SchedulePageRoute = () => {
  const locationFilterActions = useMakeLocationFilterActions()
  const filterStore = useCreateFilterStore()

  return (
    <LocationFilterActionsContext.Provider value={locationFilterActions}>
      <FilterStoreContext.Provider value={filterStore}>
        <SchedulePageContainer />
      </FilterStoreContext.Provider>
    </LocationFilterActionsContext.Provider>
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
