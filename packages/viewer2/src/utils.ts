import { useLocation } from "@tanstack/react-router"
import { parseISO } from "date-fns"

let overrideDate: Date | undefined

export const useNow = (): Date => {
  const loc = useLocation()
  const hashParams = new URLSearchParams(loc.hash)
  const dateParam = hashParams.get("date")
  if (dateParam) {
    const parsed = parseISO(dateParam)
    if (!isNaN(parsed.getTime())) {
      overrideDate = parsed
    }
  }

  if (overrideDate) {
    return overrideDate
  }

  return new Date()
}
