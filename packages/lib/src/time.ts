import { isAfter, isBefore } from "date-fns"
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
