import { sortIntervalsByStartDate } from "./time.js"
import type { Bounded, Interval, ScheduleItem } from "./types.js"

/**
 * Return whether an interval has both start and end set.
 */
export const isBounded = <T extends Interval>(t: T): t is Bounded<T> => {
  return !!t.startDate && !!t.endDate
}

/**
 * Return an array of {@link ScheduleItem} sorted by start date, then
 * {@link ScheduleEvent} objects, then ID.
 */
export const sortScheduleItems = <T extends ScheduleItem>(
  items?: Iterable<T> | null,
): T[] => {
  const strCompare = (a: ScheduleItem, b: ScheduleItem) => {
    const aId = a.id ?? ""
    const bId = b.id ?? ""
    return aId.localeCompare(bId, "en")
  }

  const intervalsArr = []
  const otherArr = []

  for (const item of items ?? []) {
    if ("startDate" in item) {
      intervalsArr.push(item)
    } else {
      otherArr.push(item)
    }
  }

  intervalsArr.sort(strCompare)
  otherArr.sort(strCompare)

  sortIntervalsByStartDate(intervalsArr)
  return [...otherArr, ...intervalsArr] as T[]
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
  const newObj = {} as { -readonly [K in keyof T]: T[K] }
  const keys = Object.keys(obj) as (keyof T)[]

  for (const key of keys) {
    const value = obj[key]
    if (value !== undefined) {
      newObj[key] = value
    }
  }

  return newObj as OmitUndef<T>
}
