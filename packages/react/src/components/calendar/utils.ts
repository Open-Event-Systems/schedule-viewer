import { TZDate } from "@date-fns/tz"
import { add, format, isAfter } from "date-fns"

export const useCalendarMarks = (start: Date, end: Date): string[] => {
  const tz = start instanceof TZDate ? start.timeZone : undefined
  const marks = []
  let cur = new TZDate(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    0,
    0,
    0,
    tz,
  )
  while (!isAfter(cur, end)) {
    marks.push(format(cur, "h:mm aaa"))
    cur = add(cur, { hours: 1 })
  }

  return marks
}
