import {
  FilterContext,
  type FilterSettings,
  type FilterUpdateAction,
  type ScheduleType,
} from "@open-event-systems/schedule-react"
import { Outlet } from "@tanstack/react-router"
import { createContext, useReducer, useState } from "react"

export const ViewTypeContext = createContext<
  [ScheduleType | undefined, (type: ScheduleType | undefined) => void]
>([undefined, () => {}])

export const FilterStateRoute = () => {
  const [state, update] = useReducer(
    (prevState: FilterSettings, action: FilterUpdateAction) => {
      return {
        ...prevState,
        ...action,
      }
    },
    {
      disabledTags: new Set<string>(),
      text: "",
      onlyBookmarked: false,
      showPastEvents: false,
    },
  )
  const [viewType, setViewType] = useState<ScheduleType | undefined>()

  return (
    <FilterContext value={[state, update]}>
      <ViewTypeContext value={[viewType, setViewType]}>
        <Outlet />
      </ViewTypeContext>
    </FilterContext>
  )
}
