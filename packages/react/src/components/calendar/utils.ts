import { add, format, isAfter, set } from "date-fns"

export const useCalendarMarks = (start: Date, end: Date): string[] => {
  const marks = []
  let cur = set(start, { minutes: 0, seconds: 0, milliseconds: 0 })

  while (!isAfter(cur, end)) {
    marks.push(format(cur, "h:mm aaa"))
    cur = add(cur, { hours: 1 })
  }

  return marks
}
