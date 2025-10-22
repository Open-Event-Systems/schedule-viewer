import { useLocation, ValidateLinkOptions } from "@tanstack/react-router"
import { DayFilterDay } from "@open-event-systems/schedule-react/components/day-filter/day-filter"
import { useNavigate } from "@tanstack/react-router"
import { useCallback } from "react"

export const useSelectedDayKey = (
  route: ValidateLinkOptions,
): [string | null, (day: DayFilterDay) => void] => {
  const loc = useLocation()
  const nav = useNavigate({ from: route.from })
  const params = new URLSearchParams(loc.hash)
  const key = params.get("day")
  const update = useCallback(
    (day: DayFilterDay) => {
      nav({
        ...route,
        hash: `day=${day.key}`,
        state: loc.state,
        replace: true,
      })
    },
    [nav, loc.state, route],
  )

  return [key, update]
}
