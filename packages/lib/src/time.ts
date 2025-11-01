import { add, format, isAfter, isBefore, isEqual, set } from "date-fns"
import { TZDate } from "@date-fns/tz"
import type { Day, Interval } from "./types.js"

/**
 * Return whether an interval contains a date.
 */
export const contains = (
  interval: Interval,
  d: Date,
  includeEndpoint = false,
): boolean => {
  return (
    (!interval.start || !isBefore(d, interval.start)) &&
    (!interval.end ||
      isBefore(d, interval.end) ||
      (!!includeEndpoint && isEqual(d, interval.end)))
  )
}

/**
 * Return whether two intervals intersect.
 */
export const intersects = (a: Interval, b: Interval): boolean => {
  return (
    (!!b.start && contains(a, b.start)) ||
    (!!a.start && contains(b, a.start)) ||
    (!a.start && !b.start)
  )
}

/**
 * Convert a date into a timezone-specific date.
 */
export const toTimezone = (d: Date, tz?: string): TZDate => {
  return new TZDate(d, tz)
}

/**
 * Convert an interval to use timezone-specific dates.
 */
export const intervalToTimezone = (t: Interval, tz?: string): Interval => {
  const newDates: { start?: Date; end?: Date } = {}

  if (t.start) {
    newDates.start = toTimezone(t.start, tz)
  }
  if (t.end) {
    newDates.end = toTimezone(t.end, tz)
  }

  return newDates
}

/**
 * Sort an array of intervals by start date, in place.
 *
 * Undefined start dates are before all defined start dates.
 */
export const sortIntervalsByStartDate = <T extends Interval[]>(arr: T): T => {
  arr.sort((a, b) => {
    if (a.start && b.start) {
      if (isBefore(a.start, b.start)) {
        return -1
      } else if (isAfter(a.start, b.start)) {
        return 1
      } else {
        return 0
      }
    } else if (!a.start && b.start) {
      return -1
    } else if (a.start && !b.start) {
      return 1
    } else {
      return 0
    }
  })
  return arr
}

/**
 * Get the default timezone from the browser.
 */
export const getDefaultTZ = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (_e) {
    return "America/New_York"
  }
}

/**
 * Get an interval representing the day a date occurs on, subject to the day
 * change hour.
 */
export const getDay = (d: Date, dayChangeHour = 0): Day => {
  const shifted = add(d, { hours: -dayChangeHour })
  const start = set(shifted, {
    hours: dayChangeHour,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })
  const key = format(start, "yyyy-MM-dd")

  return { key, start, end: add(start, { days: 1 }) }
}

/**
 * Get the days for a collection of items.
 */
export const getDays = (
  items: Iterable<{ readonly start: Date }>,
  dayChangeHour?: number,
): readonly Day[] => {
  const days = new Map<string, Day>()

  for (const item of items) {
    const day = getDay(item.start, dayChangeHour)
    days.set(day.key, day)
  }

  const dayArr = [...days.values()]
  sortIntervalsByStartDate(dayArr)
  return dayArr
}

/**
 * Get the current day from an iterable of days.
 */
export const getDefaultDay = (
  days: Iterable<Day>,
  now: Date,
): Day | undefined => {
  const daysArr = [...days]

  if (daysArr.length == 0) {
    return
  }

  for (const day of days) {
    if (contains(day, now)) {
      return day
    }
  }

  const lastDay = daysArr[daysArr.length - 1]

  if (lastDay && !isBefore(now, lastDay.end)) {
    return lastDay
  } else {
    return daysArr[0]
  }
}
