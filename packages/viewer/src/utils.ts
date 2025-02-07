import { TZDate } from "@date-fns/tz"
import { DayFilterDay } from "@open-event-systems/schedule-components/day-filter/DayFilter"
import {
  contains,
  Event,
  getDay,
  sortByDate,
} from "@open-event-systems/schedule-lib"
import { format, isBefore } from "date-fns"

/**
 * Get the days for a collection of events.
 */
export const getDays = (
  events: Iterable<Required<Pick<Event, "start">>>,
  tz: string,
  dayChangeHour?: number
): readonly DayFilterDay[] => {
  const days = new Map<string, DayFilterDay>()

  for (const event of events) {
    const day = getDay(event.start, tz, dayChangeHour)
    const key = format(day.start, "yyyy-MM-dd")
    if (!days.has(key)) {
      days.set(key, { key, ...day })
    }
  }

  const dayArr = Array.from(days.values())
  sortByDate(dayArr)
  return dayArr
}

/**
 * Get the default day.
 */
export const getDefaultDay = (
  days: readonly DayFilterDay[],
  now: Date
): DayFilterDay | undefined => {
  if (days.length == 0) {
    return
  }

  for (const day of days) {
    if (contains(day, now)) {
      return day
    }
  }

  if (!isBefore(now, days[days.length - 1].end)) {
    return days[days.length - 1]
  } else {
    return days[0]
  }
}
