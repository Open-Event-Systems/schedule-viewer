import { add, isAfter, isBefore, isEqual } from "date-fns"
import { TZDate } from "@date-fns/tz"
import { Interval } from "./types.js"

/**
 * Return whether an interval contains a date.
 */
export const contains = (
  interval: Interval,
  d: Date,
  includeEndpoint = false,
): boolean => {
  return (
    !isBefore(d, interval.start) &&
    (isBefore(d, interval.end) ||
      (!!includeEndpoint && isEqual(interval.end, d)))
  )
}

/**
 * Return whether two intervals intersect.
 */
export const intersects = (a: Interval, b: Interval): boolean => {
  return contains(a, b.start) || contains(b, a.start)
}

/**
 * Convert a date into a timezone-specific date.
 */
export const toTimezone = (d: Date, tz?: string): TZDate => {
  return new TZDate(d, tz)
}

/**
 * Sort an array of intervals by start date, in place.
 *
 * Undefined start dates are after all defined start dates.
 */
export const sortByDate = <
  T extends Readonly<{ start?: Date | null; end?: Date | null }>[],
>(
  arr: T,
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
export const getDay = (d: Date, tz: string, dayChangeHour = 0): Interval => {
  const shift = add(d, { hours: -dayChangeHour })
  const start = new TZDate(
    shift.getFullYear(),
    shift.getMonth(),
    shift.getDate(),
    dayChangeHour,
    0,
    0,
    0,
    tz,
  )
  return { start, end: add(start, { days: 1 }) }
}
