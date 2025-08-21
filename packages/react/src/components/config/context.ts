import {
  ScheduleConfig,
  TagEntry,
  TagIndicatorEntry,
} from "@open-event-systems/schedule-lib"
import { createContext, useContext } from "react"

const getDefaultTZ = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (_e) {
    return "America/New_York"
  }
}

export const DEFAULT_SCHEDULE_CONFIG = {
  id: "schedule",
  title: "Event",
  description: "",
  events: [],
  binMinutes: 30,
  dayChangeHour: 6,
  timeZone: getDefaultTZ(),
  tags: [],
  tagIndicators: [],
} as const

export const ScheduleConfigContext = createContext<ScheduleConfig>(
  DEFAULT_SCHEDULE_CONFIG,
)

export const ScheduleConfigProvider = ScheduleConfigContext.Provider

export const useScheduleConfig = (): ScheduleConfig =>
  useContext(ScheduleConfigContext)

export const makeValidTagsFilter = (
  tags: Iterable<TagEntry>,
): ((t: string) => boolean) => {
  const tagSet = new Set(Array.from(tags, (t) => t[0]))
  const filter = (t: string) => {
    return tagSet.has(t)
  }
  return filter
}

export const makeTagFormatter = (
  tags: Iterable<TagEntry>,
): ((t: string) => string) => {
  const entries = new Map<string, string>()
  for (const [tag, name] of tags) {
    entries.set(tag, name)
  }
  const formatter = (t: string) => {
    return entries.get(t) ?? t
  }
  return formatter
}

export const makeTagIndicatorFunc = (
  entries: Iterable<TagIndicatorEntry>,
): ((tags: readonly string[]) => string | undefined) => {
  const entryArr = Array.from(entries)
  const func = (tags: readonly string[]) => {
    const match = entryArr.find((e) => indicatorEntryMatches(tags, e))
    return match ? match[1] : undefined
  }
  return func
}

const indicatorEntryMatches = (
  tags: readonly string[],
  entry: TagIndicatorEntry,
): boolean => {
  const [key] = entry
  if (typeof key == "string") {
    return tags.some((t) => t == key)
  } else if (Array.isArray(key)) {
    return key.every((k) => tags.includes(k))
  } else {
    return false
  }
}
