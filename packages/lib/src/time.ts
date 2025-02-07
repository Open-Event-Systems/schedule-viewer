import { add, isAfter, isBefore } from "date-fns"
import { TZDate } from "@date-fns/tz"
import { Timespan } from "./types.js"

/**
 * Return whether a timespan contains a date.
 */
export const contains = (ts: Timespan, d: Date): boolean => {
  return !isBefore(d, ts.start) && isBefore(d, ts.end)
}

/**
 * Return whether two timespans intersect.
 */
export const intersects = (a: Timespan, b: Timespan): boolean => {
  return contains(a, b.start) || contains(b, a.start)
}

/**
 * Convert a date into a timezone-specific date.
 */
export const toTimezone = (d: Date, tz?: string): TZDate => {
  return new TZDate(d, tz)
}

/**
 * Sort an array of timestamps by date, in place.
 */
export const sortByDate = <
  T extends Readonly<{ start?: Date | null; end?: Date | null }>[]
>(
  arr: T
): T => {
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
      return 1
    } else if (a.start && !b.start) {
      return -1
    } else {
      return 0
    }
  })
  return arr
}

/**
 * Get a Date representing the day a date occurs on, subject to the day change
 * hour.
 */
export const getDay = (d: Date, tz: string, dayChangeHour = 0): Timespan => {
  const shift = add(d, { hours: -dayChangeHour })
  const start = new TZDate(
    shift.getFullYear(),
    shift.getMonth(),
    shift.getDate(),
    dayChangeHour,
    0,
    0,
    0,
    tz
  )
  return { start, end: add(start, { days: 1 }) }
}
