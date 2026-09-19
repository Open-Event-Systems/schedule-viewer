/**
 * Sort/filter tools.
 * @module
 */

import type { Dayjs } from "dayjs"
import { contains } from "./time.js"
import type { Interval, ScheduleItem, ScheduleItemType } from "./types.js"
import { iterToArr, iterToSet } from "./utils.js"

export type TagFilterMode = "include" | "exclude"

export type MakeFilterOptions = Readonly<{
  /**
   * The search string.
   */
  search?: string | null

  /**
   * Whether to exclude disabled tags or include non-disabled tags.
   */
  tagFilterMode?: TagFilterMode | null

  /**
   * The disabled tags.
   */
  disabledTags?: Iterable<string> | null

  /**
   * The bookmarked item IDs.
   */
  bookmarksFilterSelections?: Iterable<string> | null

  /**
   * The visited item IDs.
   */
  unvisitedFilterSelections?: Iterable<string> | null

  /**
   * Hide items ending on or before this date.
   */
  hidePastFilter?: Dayjs | null

  /**
   * Only include items beginning in this interval.
   */
  dateFilter?: Interval | null
}>

/**
 * Return a filter that applies multiple filter settings.
 */
export const makeFilter = (
  settings: MakeFilterOptions,
): ((obj: {
  readonly item?: ScheduleItem
  readonly startDate?: Dayjs
  readonly endDate?: Dayjs
}) => boolean) => {
  const filterChain: ((obj: {
    readonly item?: ScheduleItem
    readonly startDate?: Dayjs
    readonly endDate?: Dayjs
  }) => boolean)[] = []

  if (settings.bookmarksFilterSelections) {
    filterChain.push(
      makeSelectionsFilter("include", settings.bookmarksFilterSelections),
    )
  }

  if (settings.unvisitedFilterSelections) {
    filterChain.push(
      makeSelectionsFilter("exclude", settings.unvisitedFilterSelections),
    )
  }

  if (settings.hidePastFilter) {
    filterChain.push(makePastItemFilter(settings.hidePastFilter))
  }

  if (settings.dateFilter) {
    filterChain.push(makeDateFilter(settings.dateFilter))
  }

  if (settings.tagFilterMode && settings.disabledTags) {
    filterChain.push(
      makeTagFilter(settings.tagFilterMode, settings.disabledTags),
    )
  }

  if (settings.search) {
    filterChain.push(makeSearchFilter(settings.search))
  }

  return (obj) => {
    for (const filter of filterChain) {
      if (!filter(obj)) {
        return false
      }
    }

    return true
  }
}

type TestFunc<P, A extends P> = <T>(
  obj: T & Readonly<P>,
) => obj is T & Readonly<A>
type ItemTestFunc<P, A extends P> = <T>(
  obj: T & { readonly item?: Readonly<P> },
) => obj is T & { readonly item: Readonly<A> }

/**
 * Return a filter for items matching the given search string.
 */
export const makeSearchFilter = (
  search: string,
): ItemTestFunc<{ name?: string }, { name: string }> => {
  const lowerName = search.trim().toLowerCase()
  return ((obj) =>
    !!obj.item?.name &&
    obj.item.name.toLowerCase().includes(lowerName)) as ItemTestFunc<
    { name?: string },
    { name: string }
  >
}

/**
 * Return a filter for items by type.
 */
export const makeItemTypeFilter = <K extends ScheduleItemType>(
  types: Iterable<K>,
): ItemTestFunc<{ type?: string }, { type: K }> => {
  const typeSet = iterToSet<string>(types)
  return ((obj) =>
    typeof obj.item?.type == "string" &&
    typeSet.has(obj.item.type)) as ItemTestFunc<{ type?: string }, { type: K }>
}

/**
 * Return a filter for items based on tags.
 */
export const makeTagFilter = (
  mode: "include" | "exclude",
  tags?: Iterable<string> | null,
): ItemTestFunc<{ tags?: Iterable<string> }, { tags: Iterable<string> }> => {
  if (mode == "include") {
    const tagsSet = new Set(tags)
    return ((obj) => {
      return iterToArr(obj.item?.tags).some((itemTag) => !tagsSet.has(itemTag))
    }) as ItemTestFunc<{ tags?: Iterable<string> }, { tags: Iterable<string> }>
  } else {
    const tagsArr = [...(tags ?? [])]
    return ((obj) => {
      return tagsArr.every((exclTag) => !iterHas(exclTag, obj.item?.tags))
    }) as ItemTestFunc<{ tags?: Iterable<string> }, { tags: Iterable<string> }>
  }
}

/**
 * Return a filter for sum of products tag logic.
 */
export const makeTagLogicFilter = (
  mode: "include" | "exclude",
  tagSets?: Iterable<Iterable<string>>,
) => {
  const products: string[][] = []
  for (const tagSet of tagSets ?? []) {
    products.push([...tagSet])
  }

  return ((obj) => {
    const itemTagSet = iterToSet(obj.item?.tags)
    const match = products.some((product) =>
      product.every((tag) => itemTagSet.has(tag)),
    )
    return mode == "include" ? match : !match
  }) as ItemTestFunc<{ tags?: Iterable<string> }, { tags: Iterable<string> }>
}

/**
 * Return a filter for items whose ID is included/excluded in the given item IDs.
 */
export const makeSelectionsFilter = (
  mode: "include" | "exclude",
  itemIds?: Iterable<string> | null,
): ItemTestFunc<{ id?: string }, { id: string }> => {
  const idSet = iterToSet(itemIds)
  if (mode == "include") {
    return ((obj) =>
      obj.item?.id != null && idSet.has(obj.item.id)) as ItemTestFunc<
      { id?: string },
      { id: string }
    >
  } else {
    return ((obj) =>
      obj.item?.id == null || !idSet.has(obj.item.id)) as ItemTestFunc<
      { id?: string },
      { id: string }
    >
  }
}

/**
 * Return a filter for items whose endDate is not in the past.
 */
export const makePastItemFilter = (
  now: Dayjs,
): TestFunc<{ endDate?: Dayjs }, { endDate: Dayjs }> => {
  return ((obj) => !obj.endDate || now.isBefore(obj.endDate)) as TestFunc<
    { endDate?: Dayjs },
    { endDate: Dayjs }
  >
}

/**
 * Get a filter function for items beginning in the given {@link Interval}.
 */
export const makeDateFilter = (
  range: Interval,
): TestFunc<{ startDate?: Dayjs }, { startDate: Dayjs }> => {
  return ((obj) => {
    if (!obj.startDate) {
      return false
    }
    return contains(range, obj.startDate)
  }) as TestFunc<{ startDate?: Dayjs }, { startDate: Dayjs }>
}

/**
 * Return a generator from an iterable of items where each item ID only appears once.
 *
 * Items with no ID are always yielded.
 */
export function* iterUniqueIds<
  T extends { readonly item?: { readonly id?: string } },
>(objs?: Iterable<T> | null): Generator<T, void, unknown> {
  const seenSet = new Set<string>()
  for (const obj of objs ?? []) {
    if (obj.item?.id != null && seenSet.has(obj.item.id)) {
      continue
    }

    if (obj.item?.id != null) {
      seenSet.add(obj.item.id)
    }
    yield obj
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

export type SetDisabledTagsFunc = {
  (tags?: Iterable<string> | null): void
  (tags: Iterable<string> | null, disabled: boolean): void
}

/**
 * Return a function to update the disabled tags state.
 * @param updateFunc - A setState like function.
 */
export const makeSetDisabledTagsFunc = (
  updateFunc: (update: (prev?: Iterable<string> | null) => Set<string>) => void,
): SetDisabledTagsFunc => {
  return (tags?: Iterable<string> | null, disabled?: boolean) => {
    updateFunc((prev) => {
      if (disabled != null) {
        // partial update
        const newSet = new Set(prev)
        for (const tag of tags ?? []) {
          if (disabled) {
            newSet.add(tag)
          } else {
            newSet.delete(tag)
          }
        }
        return newSet
      } else {
        // replace
        return new Set(prev)
      }
    })
  }
}
