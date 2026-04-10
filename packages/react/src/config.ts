import {
  composeScheduleAPIs,
  makeScheduleFetchAPI,
  makeParsedScheduleItemsAPI,
  makeSortedScheduleAPI,
  makeTZScheduleAPI,
  type ScheduleAPI,
  optional,
  omitUndef,
} from "@open-event-systems/schedule-lib"
import z from "zod"
import type { ScheduleConfig, TagEntry, TagIndicatorEntry } from "./types.js"

const tagEntrySchema = z.codec(
  z.union([
    z.tuple([z.string(), z.string()]),
    z.looseObject({
      tag: z.string(),
      title: z.string(),
    }),
  ]),
  z.custom<TagEntry>(),
  {
    decode: (v) => {
      if (Array.isArray(v)) {
        const [tag, title] = v
        return { tag, title }
      } else {
        return v
      }
    },
    encode: (v) => v,
  },
)

const tagIndicatorSchema = z.codec(
  z.union([
    z.tuple([z.union([z.string(), z.array(z.string())]), z.string()]),
    z.looseObject({
      tags: z.array(z.string()),
      label: z.string(),
    }),
  ]),
  z.custom<TagIndicatorEntry>(),
  {
    decode: (v) => {
      if (Array.isArray(v)) {
        const [tags, label] = v
        if (Array.isArray(tags)) {
          return { tags, label }
        } else {
          return { tags: [tags], label }
        }
      } else {
        return v
      }
    },
    encode: (v) => ({ tags: [...v.tags], label: v.label }),
  },
)

const configSchema = z.looseObject({
  id: z.string(),
  items: optional(z.array(z.union([z.string(), z.looseObject({})]))),
  title: optional(z.string()),
  description: optional(z.string()),
  dayChangeHour: optional(z.number()),
  dayFormat: optional(z.string()),
  timeZone: optional(z.string()),
  tags: optional(z.array(tagEntrySchema)),
  tagIndicators: optional(z.array(tagIndicatorSchema)),
  bookmarks: optional(z.string()),
  selectionsService: optional(z.string()),
  icalPrefix: optional(z.string()),
  icalDomain: optional(z.string()),
})

export type ScheduleConfigInput = z.input<typeof configSchema>

const getDefaultTZ = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (_e) {
    return "America/New_York"
  }
}

export const DEFAULT_SCHEDULE_CONFIG = {
  id: "schedule",
  items: [],
  title: "Schedule",
  timeZone: getDefaultTZ(),
  dayChangeHour: 6,
  dayFormat: "EEEE, MMM d",
  tags: [],
  tagIndicators: [],
  icalPrefix: "schedule",
} as const satisfies ScheduleConfig

/**
 * Parse a {@link ScheduleConfig} object.
 */
export const parseConfig = (configData: unknown): ScheduleConfig => {
  const parsed = configSchema.parse(configData)
  const config: ScheduleConfig = {
    ...DEFAULT_SCHEDULE_CONFIG,
    icalPrefix: parsed.id,
    ...omitUndef(parsed),
  }

  return config
}

export const makeScheduleAPIFromConfig = (
  config: ScheduleConfig,
): ScheduleAPI => {
  const urls = config.items.filter((it) => typeof it == "string")
  const objs = config.items.filter((it) => typeof it != "string")
  const parsedAPI = makeParsedScheduleItemsAPI(objs)
  const urlAPIs = urls.map((url) => makeScheduleFetchAPI(url))
  const allAPIs = [parsedAPI, ...urlAPIs]

  const composed = composeScheduleAPIs(...allAPIs)
  const tz = makeTZScheduleAPI(composed)
  const sorted = makeSortedScheduleAPI(tz)
  return sorted
}

export const makeValidTagsFilter = (
  tags: Iterable<TagEntry>,
): ((t: string) => boolean) => {
  const tagSet = new Set(Array.from(tags, (t) => t.tag))
  const filter = (t: string) => {
    return tagSet.has(t)
  }
  return filter
}

export const makeTagFormatter = (
  tags: Iterable<TagEntry>,
): ((t: string) => string) => {
  const map = new Map<string, string>()
  for (const entry of tags) {
    map.set(entry.tag, entry.title)
  }
  const formatter = (t: string) => {
    return map.get(t) ?? t
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
    return match?.label
  }
  return func
}

const indicatorEntryMatches = (
  tags: readonly string[],
  entry: TagIndicatorEntry,
): boolean => {
  return entry.tags.every((k) => tags.includes(k))
}
