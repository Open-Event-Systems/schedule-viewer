import {
  FilterContext,
  type FilterSettings,
  type FilterUpdateAction,
} from "@open-event-systems/schedule-react"
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router"
import { useCallback, useReducer } from "react"

declare module "@tanstack/react-router" {
  interface HistoryState {
    selectedDayKey?: string
    showPastEvents?: boolean
  }
}

export const FilterStateRoute = () => {
  // split filter props between location state and a reducer
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
    },
  )

  const {
    state: { selectedDayKey, showPastEvents },
  } = useLocation()

  const navigate = useNavigate()

  const finalState = {
    ...state,
    selectedDayKey,
    showPastEvents: !!showPastEvents,
  }

  const finalUpdate = useCallback(
    (action: FilterUpdateAction) => {
      const { selectedDayKey, showPastEvents, ...other } = action
      update(other)
      if (selectedDayKey || showPastEvents != null) {
        navigate({
          state: (cur) => {
            return {
              ...cur,
              ...(selectedDayKey && { selectedDayKey }),
              ...(showPastEvents != null && { showPastEvents }),
            }
          },
          replace: true,
        })
      }
    },
    [update, navigate],
  )

  return (
    <FilterContext value={[finalState, finalUpdate]}>
      <Outlet />
    </FilterContext>
  )
}
