import { sortIntervalsByStartDate } from "./time.js"
import type { Bounded, Interval, ScheduleItem } from "./types.js"

/**
 * Return a filter for bookmarked items.
 */
export const makeBookmarkFilter = (
  itemIds: Iterable<string>,
): ((e: { readonly id: string }) => boolean) => {
  const idSet = new Set(itemIds)
  return (e) => {
    return idSet.has(e.id)
  }
}

/**
 * Return whether an interval has both start and end set.
 */
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
