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
 * Return a filter for unvisited items.
 */
export const makeUnvisitedFilter = (
  itemIds?: Iterable<string>,
): ((e: { readonly id: string }) => boolean) => {
  const idSet = new Set(itemIds)
  return (e) => {
    return !idSet.has(e.id)
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

/**
 * Return an object with `undefined` values omitted.
 */
export const omitUndef = <T extends Readonly<Record<string, unknown>>>(
  obj: T,
): T => {
  const newObj: Partial<T> = {}

  for (const k of Object.keys(obj)) {
    const key = k as keyof T
    const value = obj[key]
    if (value !== undefined) {
      newObj[key] = value
    }
  }

  return newObj as T
}
