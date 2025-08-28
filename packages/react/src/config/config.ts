import { EventJSON } from "@open-event-systems/schedule-lib"
import { createContext, useContext } from "react"

export type TagEntry = readonly [string, string]

export type TagIndicatorEntry = readonly [string | readonly string[], string]

export interface ScheduleConfigJSON {
  readonly id: string
  readonly events?: string | readonly EventJSON[]
  readonly title?: string
  readonly description?: string
  readonly dayChangeHour?: number
  readonly binMinutes?: number
  readonly timeZone?: string
  readonly tags?: readonly TagEntry[]
  readonly tagIndicators?: readonly TagIndicatorEntry[]
  readonly bookmarks?: string
  readonly icalPrefix?: string
  readonly icalDomain?: string
}

export type ScheduleConfig = Readonly<{
  id: string
  events: string | readonly EventJSON[]
  title: string
  description: string
  dayChangeHour: number
  binMinutes: number
  timeZone: string
  tags: readonly TagEntry[]
  tagIndicators: readonly TagIndicatorEntry[]
  bookmarks?: string
  icalPrefix: string
  icalDomain: string
}>

const getDefaultTZ = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (_e) {
    return "America/New_York"
  }
}

export const DEFAULT_SCHEDULE_CONFIG = {
  id: "",
  events: [],
  title: "Schedule",
  description: "",
  dayChangeHour: 6,
  binMinutes: 30,
  timeZone: getDefaultTZ(),
  tags: [],
  tagIndicators: [],
  icalPrefix: "",
  icalDomain: "",
} as const satisfies ScheduleConfig

/**
 * Make a {@link ScheduleConfig} object.
 */
export const makeConfig = (configData: ScheduleConfigJSON): ScheduleConfig => {
  const config = {
    ...DEFAULT_SCHEDULE_CONFIG,
    ...configData,
  }

  return config
}

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
): ((tags: Iterable<string>) => string | undefined) => {
  const entryArr = Array.from(entries)
  const func = (tags: Iterable<string>) => {
    const tagsArr = [...tags]
    const match = entryArr.find((e) => indicatorEntryMatches(tagsArr, e))
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
