import {
  composeScheduleAPIs,
  makeScheduleFetchAPI,
  makeScheduleItemsArrayAPI,
  makeSortedScheduleAPI,
  makeTZScheduleAPI,
  ScheduleAPI,
} from "@open-event-systems/schedule-lib"
import { createContext, useContext } from "react"
import z from "zod"

export type TagEntry = Readonly<{
  tag: string
  title: string
}>

export type TagIndicatorEntry = Readonly<{
  tags: readonly string[]
  label: string
}>

export type ScheduleConfig = Readonly<{
  id: string
  items: readonly (string | Record<string, unknown>)[]
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

const opt = <OutT, InT>(
  s: z.ZodType<OutT, InT>,
): z.ZodType<OutT | undefined, InT | null | undefined> =>
  s.nullish().transform((v) => v ?? undefined)

const tagEntrySchema = z
  .union([
    z.tuple([z.string(), z.string()]),
    z.object({
      tag: z.string(),
      title: z.string(),
    }),
  ])
  .transform((v) => {
    if (Array.isArray(v)) {
      return {
        tag: v[0],
        title: v[1],
      }
    } else {
      return v
    }
  })

const tagIndicatorSchema = z
  .union([
    z.tuple([z.union([z.string(), z.array(z.string())]), z.string()]),
    z.object({
      tags: z.array(z.string()),
      label: z.string(),
    }),
  ])
  .transform((v): TagIndicatorEntry => {
    if (Array.isArray(v)) {
      const [tags, label] = v
      if (Array.isArray(tags)) {
        return {
          tags,
          label,
        }
      } else {
        return {
          tags: [tags],
          label: label,
        }
      }
    } else {
      return v
    }
  })

const configSchema = z
  .looseObject({
    id: opt(z.string()),
    items: opt(z.array(z.union([z.string(), z.looseObject({})]))),
    title: opt(z.string()),
    description: opt(z.string()),
    dayChangeHour: opt(z.number()),
    binMinutes: opt(z.number()),
    timeZone: opt(z.string()),
    tags: opt(z.array(tagEntrySchema)),
    tagIndicators: opt(z.array(tagIndicatorSchema)),
    bookmarks: opt(z.string()),
    icalPrefix: opt(z.string()),
    icalDomain: opt(z.string()),
  })
  .partial()

export type ScheduleConfigInput = z.input<typeof configSchema>

const getDefaultTZ = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (_e) {
    return "America/New_York"
  }
}

export const DEFAULT_SCHEDULE_CONFIG = {
  id: "",
  items: [],
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
export const makeConfig = (configData: ScheduleConfigInput): ScheduleConfig => {
  const parsed = configSchema.parse(configData)
  const config = {
    ...DEFAULT_SCHEDULE_CONFIG,
    ...parsed,
  }

  return config
}

export const ScheduleConfigContext = createContext<ScheduleConfig>(
  DEFAULT_SCHEDULE_CONFIG,
)
export const ScheduleConfigProvider = ScheduleConfigContext.Provider
export const useScheduleConfig = (): ScheduleConfig =>
  useContext(ScheduleConfigContext)

export const makeScheduleAPIFromConfig = (
  config: ScheduleConfig,
): ScheduleAPI => {
  const urls = config.items.filter((it) => typeof it == "string")
  const objs = config.items.filter((it) => typeof it != "string")
  const parsedAPI = makeScheduleItemsArrayAPI(objs)
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
