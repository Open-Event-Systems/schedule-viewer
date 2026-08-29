/**
 * Sort/filter tools.
 * @module
 */

import type { Dayjs } from "dayjs"
import type { Interval } from "./types.js"
import { contains } from "./time.js"

/**
 * Return a filter for items matching the given search string.
 */
export const makeNameFilter = (
  name: string,
): (<T extends { readonly name?: string }>(
  item: T,
) => item is T & { readonly name: string }) => {
  const lowerName = name.trim().toLowerCase()
  return <T extends { readonly name?: string }>(
    item: T,
  ): item is T & { readonly name: string } =>
    !!item.name && item.name.toLowerCase().includes(lowerName)
}

/**
 * Return a filter for items based on tags.
 */
export const makeTagFilter = (
  mode: "include" | "exclude",
  tags?: Iterable<string> | null,
): ((item: { readonly tags?: Iterable<string> }) => boolean) => {
  const tagsArr = [...(tags ?? [])]

  if (mode == "include") {
    return (item) => {
      return tagsArr.some((inclTag) => iterHas(inclTag, item.tags))
    }
  } else {
    return (item) => {
      return tagsArr.every((exclTag) => !iterHas(exclTag, item.tags))
    }
  }
}

/**
 * Return a filter for items whose ID is included/excluded in the given item IDs.
 */
export const makeSelectionsFilter = (
  mode: "include" | "exclude",
  itemIds?: Iterable<string> | null,
): ((item: { readonly id?: string }) => boolean) => {
  const idSet = new Set(itemIds)
  if (mode == "include") {
    return (item) => item.id != null && idSet.has(item.id)
  } else {
    return (item) => item.id == null || !idSet.has(item.id)
  }
}

/**
 * Return a filter for items whose endDate is not in the past.
 */
export const makePastItemFilter = (
  now: Dayjs,
): ((item: { readonly endDate?: Dayjs }) => boolean) => {
  return (item) => !item.endDate || now.isBefore(item.endDate)
}

/**
 * Get a filter function for items beginning in the given {@link Interval}.
 */
export const makeDateFilter = (
  range: Interval,
): (<T extends { readonly startDate?: Dayjs; readonly endDate?: Dayjs }>(
  item: T,
) => item is T & { readonly startDate: Dayjs }) => {
  return <T extends { readonly startDate?: Dayjs; readonly endDate?: Dayjs }>(
    item: T,
  ): item is T & { readonly startDate: Dayjs } => {
    if (!item.startDate) {
      return false
    }
    return contains(range, item.startDate)
  }
}

/**
 * Modify a filter function to work on schedule object occurrences.
 */
export const toOccurrenceFilter = <T,>(f: (item: T) => boolean): (item: { readonly object: T }) => boolean => {
  return (item: { readonly object: T }) => {
    return f(item.object)
  }
}

/**
 * Return a generator from an iterable of items where each item ID only appears once.
 *
 * Items with no ID are always yielded.
 */
export function* iterUniqueIds<T extends { readonly id?: string }>(
  items?: Iterable<T> | null,
): Generator<T, void, unknown> {
  const seenSet = new Set<string>()
  for (const item of items ?? []) {
    if (item.id != null && seenSet.has(item.id)) {
      continue
    }

    if (item.id != null) {
      seenSet.add(item.id)
    }
    yield item
  }
}

const iterHas = <T>(value: T, iter?: Iterable<T> | null): boolean => {
  if (iter instanceof Set) {
    return iter.has(value)
  } else if (Array.isArray(iter)) {
    return iter.includes(value)
  } else {
    for (const item of iter ?? []) {
      if (item == value) {
        return true
      }
    }
    return false
  }
}
