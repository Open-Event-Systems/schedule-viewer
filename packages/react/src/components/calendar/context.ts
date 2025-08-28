import { add } from "date-fns"
import { createContext } from "react"

export type CalendarContextType = {
  start: Date
  end: Date
  direction: "row" | "column"
}

const now = new Date()

export const CalendarContext = createContext<CalendarContextType>({
  start: now,
  end: add(now, { hours: 1 }),
  direction: "column",
})
