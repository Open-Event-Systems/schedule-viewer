/**
 * Utilities for grouping and sorting schedule items.
 * @module
 */

import { type Dayjs } from "dayjs"
import { isBounded } from "./utils.js"
import { contains } from "./time.js"

export type Bin<T> = Readonly<{
  key: string
  name: string
  items: Iterable<T>
}>

export type BinFunc<InT, OutT extends InT = InT> = <T extends InT>(
  items?: Iterable<T> | null,
) => Iterable<Bin<OutT & T>>

/**
 * A function to bin items by name.
 */
export function* binByName<
  T extends { readonly name?: string },
>(items?: Iterable<T> | null): Generator<Bin<T>, void, void> {
  // first sort by name
  const mapped = []
  for (const item of items ?? []) {
    const normName = toAlphaSortable(item.name)
    const binKey = getNameBinKey(normName)
    mapped.push({
      normName: normName,
      binKey,
      item: item,
    })
  }

  // Sort by (bin key, normName)

  mapped.sort((a, b) => a.normName.localeCompare(b.normName))
  mapped.sort((a, b) => compareNameBinKey(a.binKey, b.binKey))

  let curBin: { key: string; name: string; items: T[] } | undefined

  for (const entry of mapped) {
    if (!curBin || entry.binKey != curBin.key) {
      if (curBin && curBin.items.length > 0) {
        yield curBin
      }

      curBin = {
        key: entry.binKey,
        name: entry.binKey,
        items: [],
      }
    }

    curBin.items.push(entry.item)
  }

  if (curBin && curBin.items.length > 0) {
    yield curBin
  }
}

const getNameBinKey = (normName: string) => {
  const c = normName.charAt(0)
  if (c == "") {
    return "Other"
  } else if (numPattern.test(c)) {
    return "#"
  } else {
    return c
  }
}

const getNameBinSortValue = (c: string) => {
  if (c == "" || c == "Other") {
    return 2
  } else if (c == "#") {
    return 0
  } else {
    return 1
  }
}

const compareNameBinKey = (a: string, b: string) => {
  const aVal = getNameBinSortValue(a)
  const bVal = getNameBinSortValue(b)
  if (aVal == bVal) {
    return a.localeCompare(b)
  } else {
    return aVal - bVal
  }
}

/**
 * Return a function to bin items by tags.
 */
export const makeTagBinFunc = (
  tagData: Iterable<string | Readonly<{ value: string, label?: string }>>,
): BinFunc<{ readonly tags?: Iterable<string> }> => {
  const nameByTag = new Map<string, [string, string]>()
  for (const entry of tagData) {
    const { value, label } = typeof entry == "string" ? { value: entry } : entry
    const name = label || value
    const sortKey = toAlphaSortable(name)
    if (sortKey) {
      nameByTag.set(value, [name, sortKey])
    }
  }

  return function* <
    T extends { readonly tags?: Iterable<string> },
  >(items?: Iterable<T> | null) {
    const allItems = []

    for (const item of items ?? []) {
      const validTags = Array.from(
        item.tags ?? [],
        (t) => [t, nameByTag.get(t)] as const,
      ).filter((t): t is readonly [string, [string, string]] => !!t[1])
      for (const [tag, [name, sortKey]] of validTags) {
        allItems.push({
          key: `tag-${tag}`,
          sortKey,
          binName: name,
          item: item,
        })
      }
      if (validTags.length == 0) {
        allItems.push({
          key: "na",
          sortKey: "N/A",
          binName: "N/A",
          item: item,
        })
      }
    }

    // sort
    allItems.sort((a, b) => compareTags(a.sortKey, b.sortKey))

    let curBin: { key: string; name: string; items: T[] } | undefined

    for (const item of allItems) {
      if (!curBin || curBin.key != item.key) {
        if (curBin && curBin.items.length > 0) {
          yield curBin
        }
        curBin = {
          key: item.key,
          name: item.binName,
          items: [],
        }
      }

      curBin.items.push(item.item)
    }

    if (curBin && curBin.items.length > 0) {
      yield curBin
    }
  }
}

const compareTags = (a: string, b: string) => {
  const aVal = a == "N/A" ? 1 : 0
  const bVal = b == "N/A" ? 1 : 0
  if (aVal == bVal) {
    return a.localeCompare(b)
  } else {
    return aVal - bVal
  }
}

/**
 * Return a function to bin items by start time.
 *
 * The items must be sorted by start date.
 */
export const makeTimeBinFunc = (
  now: Dayjs,
): BinFunc<
  Readonly<{ startDate?: Dayjs; endDate?: Dayjs }>,
  Readonly<{ startDate: Dayjs; endDate: Dayjs }>
> => {
  return function* <T extends Readonly<{ startDate?: Dayjs; endDate?: Dayjs }>>(
    items?: Iterable<T> | null,
  ) {
    const nonNowItems = []
    const nowBin = {
      key: "now",
      name: "Now",
      items: new Array<T & { startDate: Dayjs; endDate: Dayjs }>(),
    }

    for (const item of items ?? []) {
      if (!isBounded(item)) {
        continue
      }

      if (contains(item, now)) {
        // now items
        nowBin.items.push(item)
      } else {
        nonNowItems.push(item)
      }
    }

    if (nowBin.items.length > 0) {
      yield nowBin
    }

    let curBin:
      | {
        key: string
        keyTime: number
        name: string
        items: (T & { startDate: Dayjs; endDate: Dayjs })[]
      }
      | undefined

    for (const item of nonNowItems) {
      if (!isBounded(item)) {
        continue
      }

      const roundedStart = item.startDate
        .set("minute", Math.floor(item.startDate.minute() / 5) * 5)
        .set("second", 0)
        .set("millisecond", 0)
      const keyTime = roundedStart.valueOf()
      if (!curBin || keyTime != curBin.keyTime) {
        if (curBin && curBin.items.length > 0) {
          yield curBin
        }

        curBin = {
          key: roundedStart.format("YYYYMMDDHHmm"),
          keyTime,
          name: roundedStart.format("h:mm a"),
          items: [],
        }
      }

      curBin.items.push(item)
    }

    if (curBin && curBin.items.length > 0) {
      yield curBin
    }
  }
}

/**
 * Return a function to bin items by day.
 *
 * The items must be sorted by start date.
 */
export const makeDayBinFunc = (
  dayChangeHour = 0,
  dateFormat = "dddd, MMMM D",
): BinFunc<Readonly<{ startDate?: Dayjs }>, Readonly<{ startDate: Dayjs }>> => {
  return function* <T extends Readonly<{ startDate?: Dayjs }>>(
    items?: Iterable<T> | null,
  ) {
    let curBin:
      | {
        key: string
        endTime: number
        name: string
        items: (T & { startDate: Dayjs })[]
      }
      | undefined

    for (const item of items ?? []) {
      if (!hasStart(item)) {
        continue
      }

      const itemTime = item.startDate.valueOf()
      if (!curBin || itemTime >= curBin.endTime) {
        if (curBin && curBin.items.length > 0) {
          yield curBin
        }

        const shiftedStart = item.startDate.subtract(dayChangeHour, "hour")
        const startDate = shiftedStart
          .set("hour", dayChangeHour)
          .set("minute", 0)
          .set("second", 0)
          .set("millisecond", 0)
        const endDate = startDate.add(1, "day")

        curBin = {
          key: startDate.format("YYYYMMDD"),
          name: startDate.format(dateFormat),
          endTime: endDate.valueOf(),
          items: [],
        }
      }

      curBin.items.push(item)
    }

    if (curBin && curBin.items.length > 0) {
      yield curBin
    }
  }
}

const hasStart = <T extends { readonly startDate?: Dayjs }>(
  item: T,
): item is T & { readonly startDate: Dayjs } => !!item.startDate

const numPattern = /[0-9]/
const nonAlphaPattern = /[^A-Z0-9]+/g

const toAlphaSortable = (s = ""): string => {
  // TODO: this could be improved using Intl.Segmenter and \p{L} to get letters
  s = s.normalize("NFKD")
  s = s.toUpperCase()
  s = s.replaceAll(nonAlphaPattern, "")
  return s
}
