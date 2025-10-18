import { sortIntervalsByStartDate } from "./time.js"
import {
  Bounded,
  Interval,
  ScheduleEvent,
  ScheduleItem,
  Vendor,
} from "./types.js"

/**
 * Set equality comparison.
 */
export const setEquals = <T>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean => {
  return a.size == b.size && [...a].every((it) => b.has(it))
}

/**
 * Return a filter for bookmarked items.
 */
export const makeBookmarkFilter = (
  eventIds: Iterable<string>,
): ((e: { readonly id: string }) => boolean) => {
  const idSet = new Set(eventIds)
  return (e) => {
    return idSet.has(e.id)
  }
}

export const isBounded = <T extends Interval>(t: T): t is Bounded<T> => {
  return !!t.start && !!t.end
}

/**
 * Sort an array of {@link ScheduleItem} by start date, then ID, in place.
 * @param arr
 */
export const sortScheduleItems = <T extends ScheduleItem[]>(arr: T): T => {
  arr = arr.sort((a, b) => a.id.localeCompare(b.id, "en"))
  arr = sortIntervalsByStartDate(arr)
  return arr
}

export const isScheduleEvent = <T extends ScheduleItem>(
  t: T,
): t is T & ScheduleEvent => {
  return t.type == "event"
}

export const isVendor = <T extends ScheduleItem>(t: T): t is T & Vendor => {
  return t.type == "vendor"
}
