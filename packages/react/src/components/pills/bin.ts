import type { ScheduleItem } from "@open-event-systems/schedule-lib"
import { format, formatISO, set } from "date-fns"
import type { TagEntry } from "../../types.js"

export type PillsItemType = ScheduleItem &
  Readonly<{
    title?: string
    tags?: Iterable<string>
  }>

export type PillsItemBin = Readonly<{
  id: string
  title: string
  items: Iterable<PillsItemType>
}>

export const binItemsByTitle = (
  items: Iterable<PillsItemType>,
): readonly PillsItemBin[] => {
  const sorted = [...items].map(
    (it) => [alphaNameSortChar(it.title), it] as const,
  )
  sorted.sort((a, b) => {
    if (a[0] && b[0]) {
      return a[0].localeCompare(b[0])
    } else if (a[0]) {
      return -1
    } else if (b[0]) {
      return 1
    } else {
      return 0
    }
  })

  const map = new Map<string, PillsItemType[]>()

  for (const item of sorted) {
    let char = item[0].charAt(0)
    if (!char) {
      char = "Other"
    }

    let bin = map.get(char)
    if (!bin) {
      bin = []
      map.set(char, bin)
    }

    bin.push(item[1])
  }

  const bins: PillsItemBin[] = []

  for (const [char, items] of map.entries()) {
    bins.push({
      id: char,
      title: char,
      items: items,
    })
  }

  bins.sort((a, b) => {
    if (a.id == "Other") {
      return 1
    } else if (b.id == "Other") {
      return -1
    } else {
      return a.id.localeCompare(b.id)
    }
  })

  return bins
}

const alphaNameSortChar = (s: string | undefined): string => {
  if (!s) {
    return ""
  }

  s = s.toLocaleUpperCase()
  s = s.replaceAll(/[^A-Z]/g, "")
  return s
}

export const binItemsByTag = (
  items: Iterable<PillsItemType>,
  tags: Iterable<TagEntry>,
): readonly PillsItemBin[] => {
  const sortedItems = [...items]
  sortedItems.sort((a, b) => {
    if (a.title && b.title) {
      return a.title.localeCompare(b.title)
    } else if (a.title) {
      return -1
    } else if (b.title) {
      return 1
    } else {
      return 0
    }
  })

  const tagTitleMap: Record<string, string | undefined> = {}
  for (const tag of tags) {
    tagTitleMap[tag.tag] = tag.title
  }

  const map = new Map<string, PillsItemType[]>()

  for (const item of sortedItems) {
    let empty = true
    for (const itemTag of item.tags ?? []) {
      const title = tagTitleMap[itemTag]
      if (!title) {
        continue
      }

      let bin = map.get(title)
      if (!bin) {
        bin = []
        map.set(title, bin)
      }

      bin.push(item)
      empty = false
    }

    if (empty) {
      let bin = map.get("N/A")
      if (!bin) {
        bin = []
        map.set("N/A", bin)
      }
      bin.push(item)
    }
  }

  const bins: PillsItemBin[] = []

  for (const [title, items] of map.entries()) {
    bins.push({
      id: title,
      title,
      items,
    })
  }

  bins.sort((a, b) => {
    if (a.id == "N/A") {
      return 1
    } else if (b.id == "N/A") {
      return -1
    } else {
      return a.id.localeCompare(b.id)
    }
  })

  return bins
}

export const binItemsByTime = (
  items: Iterable<PillsItemType>,
  binMinutes: number,
): readonly PillsItemBin[] => {
  const map = new Map<string, [Date, PillsItemType[]]>()

  for (const item of items) {
    if (item.start) {
      const binStart = binDate(item.start, binMinutes)
      const binKey = formatISO(binStart)
      let bin = map.get(binKey)
      if (!bin) {
        bin = [binStart, []]
        map.set(binKey, bin)
      }

      bin[1].push(item)
    }
  }

  const bins: PillsItemBin[] = []

  for (const [id, [date, items]] of map.entries()) {
    bins.push({
      id,
      title: format(date, "h:mm aaa"),
      items: items,
    })
  }

  return bins
}

const binDate = (d: Date, binMinutes: number): Date => {
  const roundedMinutes = Math.floor(d.getMinutes() / binMinutes) * binMinutes
  const rounded = set(d, {
    minutes: roundedMinutes,
    seconds: 0,
    milliseconds: 0,
  })
  return rounded
}
