import { sortIntervalsByStartDate } from "./time.js"
import type { Bounded, Interval, ScheduleItem } from "./types.js"

/**
 * Return a filter for bookmarked items.
 */
export const makeBookmarkFilter = (
  itemIds?: Iterable<string>,
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

/**
 * Return an iterable as an array.
 */
export function iterToArr(iterable?: null): readonly never[]
export function iterToArr<A extends readonly unknown[]>(array?: A | null): A
export function iterToArr<T>(iterable?: Iterable<T> | null): readonly T[]
export function iterToArr<T>(iterable?: Iterable<T> | null): readonly T[] {
  if (iterable == null) {
    return iterToArr.empty
  } else if (Array.isArray(iterable)) {
    return iterable
  } else {
    return [...iterable]
  }
}

// a singleton empty array is used for referential stability
iterToArr.empty = [] as const
