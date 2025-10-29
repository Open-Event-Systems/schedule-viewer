import { add, isAfter, isBefore, isEqual } from "date-fns"
import { TZDate } from "@date-fns/tz"
import type { Bounded, Interval } from "./types.js"

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
 * Get a Date representing the day a date occurs on, subject to the day change
 * hour.
 */
export const getDay = (
  d: Date,
  tz: string,
  dayChangeHour = 0,
): Bounded<Interval> => {
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
