import { sortIntervalsByStartDate } from "./time.js"
import type { Bounded, Interval, ScheduleItem } from "./types.js"

/**
 * Return whether an interval has both start and end set.
 */
export const isBounded = <T extends Interval>(t: T): t is Bounded<T> => {
  return !!t.startDate && !!t.endDate
}

/**
 * Return an array of {@link ScheduleItem} sorted by start date, then ID.
 */
export const sortScheduleObjects = <T extends ScheduleItem>(
  items?: Iterable<T> | null,
): T[] => {
  const arr = [...(items ?? [])]

  arr.sort(strCompare)

  sortIntervalsByStartDate(arr)
  return arr
}

const strCompare = (a: ScheduleItem, b: ScheduleItem) => {
  const aId = a.id ?? ""
  const bId = b.id ?? ""
  return aId.localeCompare(bId, "en")
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
 * Return an iterable as a set.
 */
export function iterToSet(iterable?: null): ReadonlySet<never>
export function iterToSet<T>(iterable?: Iterable<T> | null): ReadonlySet<T>
export function iterToSet<T>(iterable?: Iterable<T> | null): ReadonlySet<T> {
  if (iterable == null) {
    return iterToSet.empty
  } else if (iterable instanceof Set) {
    return iterable
  } else {
    return new Set(iterable)
  }
}

// a singleton empty set is used for referential stability
iterToSet.empty = new Set() as ReadonlySet<never>

export type OmitUndef<T> = {
  [K in keyof T]: Exclude<T[K], undefined>
}

export type AddUndef<T extends object> = {
  [K in keyof T]: object extends Pick<T, K> ? T[K] | undefined : T[K]
}

/**
 * Return an object with `undefined` values omitted.
 */
export const omitUndef = <T extends object>(obj: T): OmitUndef<T> => {
  const newObj = { ...obj }
  for (const key of Object.keys(newObj)) {
    const k = key as keyof typeof newObj
    if (newObj[k] === undefined) {
      delete newObj[k]
    }
  }

  return newObj as OmitUndef<T>
}
