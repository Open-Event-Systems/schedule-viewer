import {
  FilterContext,
  type FilterSettings,
  type ScheduleType,
} from "@open-event-systems/schedule-react"
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router"
import { createContext, useCallback, useReducer, useState } from "react"
import { filterStateRoute } from "../routes.js"

export const ViewTypeContext = createContext<
  [ScheduleType | undefined, (type: ScheduleType | undefined) => void]
>([undefined, () => {}])

export const FilterStateRoute = () => {
  const loc = useLocation()
  const navigate = useNavigate()
  const hashParams = new URLSearchParams(loc.hash)

  const routeMatch = filterStateRoute.useMatch()

  console.log("nav render", loc.hash)
  console.log("route match", routeMatch)

  const showPastEvents = hashParams.get("past") == "true"
  const selectedDayKey = hashParams.get("day") || undefined

  const [state, update] = useReducer(
    (prevState: FilterSettings, action: Partial<FilterSettings>) => {
      return {
        ...prevState,
        ...action,
      }
    },
    {
      disabledTags: new Set<string>(),
      text: "",
      onlyBookmarked: false,
    },
  )
  const [viewType, setViewType] = useState<ScheduleType | undefined>()

  const fullUpdate = useCallback(
    (action: Partial<FilterSettings>) => {
      const { showPastEvents, selectedDayKey, ...other } = action

      navigate({
        hash: (prev) => {
          const newParams = new URLSearchParams(prev)

          if (showPastEvents) {
            newParams.set("past", "true")
          } else if (showPastEvents === false) {
            newParams.delete("past")
          }

          if (selectedDayKey) {
            newParams.set("day", selectedDayKey)
          }

          return String(newParams)
        },
        replace: true,
      })

      update(other)
    },
    [navigate, update],
  )

  return (
    <FilterContext
      value={[{ ...state, showPastEvents, selectedDayKey }, fullUpdate]}
    >
      <ViewTypeContext value={[viewType, setViewType]}>
        <Outlet />
      </ViewTypeContext>
    </FilterContext>
  )
}
