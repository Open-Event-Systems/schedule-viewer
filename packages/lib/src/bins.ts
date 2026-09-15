/**
 * Utilities for grouping and sorting schedule items.
 * @module
 */

import type { Day } from "#src/types.js"
import { type Dayjs } from "dayjs"
import { contains } from "./time.js"
import { isBounded, iterToArr } from "./utils.js"

export type Bin<T> = Readonly<{
  key: string
  name: string
  items: Iterable<T>
}>

/**
 * A function to bin items by name.
 */
export function* binByName<
  T extends { readonly item?: { readonly name?: string } },
>(objs?: Iterable<T> | null): Generator<Bin<T>, void, void> {
  // first sort by name
  const mapped = []
  for (const obj of objs ?? []) {
    const normName = toAlphaSortable(obj.item?.name)
    const binKey = getNameBinKey(normName)
    mapped.push({
      normName: normName,
      binKey,
      item: obj,
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
  tagData: Iterable<string | Readonly<{ value: string; label?: string }>>,
): (<T extends { readonly item?: { readonly tags?: Iterable<string> } }>(
  objs?: Iterable<T> | null,
) => Iterable<Bin<T>>) => {
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
    T extends { readonly item?: { readonly tags?: Iterable<string> } },
  >(objs?: Iterable<T> | null) {
    const allItems = []

    for (const obj of objs ?? []) {
      const validTags = Array.from(
        obj.item?.tags ?? [],
        (t) => [t, nameByTag.get(t)] as const,
      ).filter((t): t is readonly [string, [string, string]] => !!t[1])
      for (const [tag, [name, sortKey]] of validTags) {
        allItems.push({
          key: `tag-${tag}`,
          sortKey,
          binName: name,
          item: obj,
        })
      }
      if (validTags.length == 0) {
        allItems.push({
          key: "na",
          sortKey: "N/A",
          binName: "N/A",
          item: obj,
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
): (<T>(
  objs?: Iterable<T & { readonly startDate?: Dayjs }> | null,
) => Iterable<Bin<T & { readonly startDate: Dayjs }>>) => {
  return function* <T>(
    objs?: Iterable<T & { readonly startDate?: Dayjs }> | null,
  ) {
    const nonNowObjs = []
    const nowBin = {
      key: "now",
      name: "Now",
      items: new Array<T & { readonly startDate: Dayjs }>(),
    }

    for (const obj of objs ?? []) {
      if (!isBounded(obj)) {
        continue
      }

      if (contains(obj, now)) {
        // now items
        nowBin.items.push(obj)
      } else {
        nonNowObjs.push(obj)
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
          items: (T & { readonly startDate: Dayjs })[]
        }
      | undefined

    for (const obj of nonNowObjs) {
      if (!isBounded(obj)) {
        continue
      }

      const roundedStart = obj.startDate
        .set("minute", Math.floor(obj.startDate.minute() / 5) * 5)
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

      curBin.items.push(obj)
    }

    if (curBin && curBin.items.length > 0) {
      yield curBin
    }
  }
}

/**
 * Return a function to bin items by day.
 */
export const makeDayBinFunc = (
  days?: Iterable<Day> | null,
  dateFormat = "dddd, MMMM D",
): (<T>(
  objs?: Iterable<T & { readonly startDate?: Dayjs }> | null,
) => Iterable<Bin<T & { readonly startDate: Dayjs }>>) => {
  const daysArr = iterToArr(days)
  return <T>(objs?: Iterable<T & { readonly startDate?: Dayjs }> | null) => {
    const bins = {} as {
      [key: string]: {
        key: string
        name: string
        items: (T & { readonly startDate: Dayjs })[]
      }
    }

    for (const obj of objs ?? []) {
      if (!obj.startDate) {
        continue
      }

      const day = getBinDay(daysArr, obj.startDate)
      if (!day) {
        continue
      }

      let bin = bins[day.key]
      if (!bin) {
        bin = {
          key: day.key,
          name: day.startDate.format(dateFormat),
          items: [],
        }
        bins[day.key] = bin
      }

      bin.items.push(obj as T & { readonly startDate: Dayjs })
    }

    const binsArr = [...Object.values(bins)]
    binsArr.sort((a, b) => a.key.localeCompare(b.key))
    return binsArr
  }
}

const getBinDay = (days: readonly Day[], date: Dayjs) => {
  for (const day of days) {
    if (contains(day, date)) {
      return day
    }
  }
}

const numPattern = /[0-9]/
const nonAlphaPattern = /[^A-Z0-9]+/g

const toAlphaSortable = (s = ""): string => {
  // TODO: this could be improved using Intl.Segmenter and \p{L} to get letters
  s = s.normalize("NFKD")
  s = s.toUpperCase()
  s = s.replaceAll(nonAlphaPattern, "")
  return s
}
