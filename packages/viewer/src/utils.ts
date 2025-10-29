import type { DayFilterDay } from "@open-event-systems/schedule-react/components/day-filter/day-filter"
import {
  contains,
  getDay,
  sortIntervalsByStartDate,
} from "@open-event-systems/schedule-lib"
import { format, isBefore } from "date-fns"

/**
 * Get the days for a collection of items.
 */
export const getDays = (
  items: Iterable<{ readonly start: Date }>,
  tz: string,
  dayChangeHour?: number,
): readonly DayFilterDay[] => {
  const days = new Map<string, DayFilterDay>()

  for (const item of items) {
    const day = getDay(item.start, tz, dayChangeHour)
    const key = format(day.start, "yyyy-MM-dd")
    if (!days.has(key)) {
      days.set(key, { key, ...day })
    }
  }

  const dayArr = Array.from(days.values())
  sortIntervalsByStartDate(dayArr)
  return dayArr
}

/**
 * Get the default day.
 */
export const getDefaultDay = (
  days: readonly DayFilterDay[],
  now: Date,
): DayFilterDay | undefined => {
  if (days.length == 0) {
    return
  }

  for (const day of days) {
    if (contains(day, now)) {
      return day
    }
  }

  const lastDay = days[days.length - 1]

  if (lastDay && !isBefore(now, lastDay.end)) {
    return days[days.length - 1]
  } else {
    return days[0]
  }
}
