import {
  FilterContext,
  useFilterState,
} from "@open-event-systems/schedule-react"
import { Outlet } from "@tanstack/react-router"

export const FilterStateRoute = () => {
  const state = useFilterState()
  return (
    <FilterContext value={state}>
      <Outlet />
    </FilterContext>
  )
}
