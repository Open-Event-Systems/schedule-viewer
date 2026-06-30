import {
  composeScheduleAPIs,
  makeScheduleFetchAPI,
  makeParsedScheduleItemsAPI,
  makeSortedScheduleAPI,
  type ScheduleAPI,
  optional,
  omitUndef,
  iterToArr,
  isoDateTimeSchema,
} from "@open-event-systems/schedule-lib"
import z from "zod"
import type {
  ScheduleConfig,
  TagConfigEntry,
  TagIndicatorConfigEntry,
} from "./types.js"
import dayjs from "dayjs"

const tagConfigEntrySchema = z.codec(
  z.union([
    z.tuple([z.string(), z.string()]),
    z.looseObject({
      tag: z.string(),
      name: z.string(),
    }),
  ]),
  z.custom<TagConfigEntry>(),
  {
    decode: (v) => {
      if (Array.isArray(v)) {
        const [tag, name] = v
        return { tag, name }
      } else {
        return v
      }
    },
    encode: (v) => v,
  },
)

const tagIndicatorConfigSchema = z.codec(
  z.union([
    z.tuple([z.union([z.string(), z.array(z.string())]), z.string()]),
    z.looseObject({
      tags: z.array(z.string()),
      label: z.string(),
    }),
  ]),
  z.custom<TagIndicatorConfigEntry>(),
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
  identifier: z.string(),
  items: optional(z.array(z.union([z.string(), z.looseObject({})]))),
  startDate: isoDateTimeSchema,
  endDate: isoDateTimeSchema,
  name: optional(z.string()),
  description: optional(z.string()),
  dayChangeHour: optional(z.number()),
  dayFormat: optional(z.string()),
  timeZone: optional(z.string()),
  tags: optional(z.array(tagConfigEntrySchema)),
  tagIndicators: optional(z.array(tagIndicatorConfigSchema)),
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
  identifier: "schedule",
  items: [],
  startDate: dayjs(new Date(0)),
  endDate: dayjs(new Date(4102444800)),
  name: "Schedule",
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
  const { bookmarks, selectionsService, timeZone, ...parsed } =
    configSchema.parse(configData)

  const defaultTz = getDefaultTZ()

  const config: ScheduleConfig = {
    ...DEFAULT_SCHEDULE_CONFIG,
    timeZone: timeZone || defaultTz,
    icalPrefix: parsed.id,
    ...omitUndef(parsed),
    selectionsService: selectionsService ?? bookmarks,
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
  const sorted = makeSortedScheduleAPI(composed)
  return sorted
}

export const makeValidTagsFilter = (
  tags?: Iterable<TagConfigEntry>,
): ((t: string) => boolean) => {
  const tagSet = new Set(iterToArr(tags).map((t) => t.tag))
  const filter = (t: string) => {
    return tagSet.has(t)
  }
  return filter
}

export const makeTagFormatter = (
  tags?: Iterable<TagConfigEntry>,
): ((t: string) => string) => {
  const map = new Map<string, string>()
  for (const entry of tags ?? []) {
    map.set(entry.tag, entry.name)
  }
  const formatter = (t: string) => {
    return map.get(t) ?? t
  }
  return formatter
}

export const makeTagIndicatorFunc = (
  entries: Iterable<TagIndicatorConfigEntry>,
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
  entry: TagIndicatorConfigEntry,
): boolean => {
  return entry.tags.every((k) => tags.includes(k))
}
