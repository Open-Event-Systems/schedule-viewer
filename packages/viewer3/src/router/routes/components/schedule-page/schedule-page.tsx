import { SchedulePageContainer } from "#src/components/schedule-page/schedule-page.js"
import {
  LocationFilterActionsContext,
  useMakeLocationFilterActions,
} from "#src/hooks/filter-location-state.js"
import {
  FilterStoreContext,
  useCreateFilterStore,
} from "@open-event-systems/schedule-react"

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
