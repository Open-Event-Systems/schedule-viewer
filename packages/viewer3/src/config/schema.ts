import {
  omitUndef,
  omitUndefSchema,
  optional,
  optionalDefaultSchema,
  type ScheduleItemType,
} from "@open-event-systems/schedule-lib"
import {
  makeTagsConfig,
  SchedulePageFeature,
  ScheduleViewType,
} from "@open-event-systems/schedule-react"
import z from "zod"
import {
  DEFAULT_CONFIG,
  type PageConfig,
  type ViewConfig,
  type ViewerConfig,
} from "./config.js"

const tagConfigSchema = z.looseObject({
  label: optional(z.string()),
  color: optional(z.string()),
  indicator: optional(z.string()),
  indicatorColor: optional(z.string()),
  textColor: optional(z.string()),
  before: optional(z.string()),
  after: optional(z.string()),
})

const viewConfigSchema = z.looseObject({
  name: optional(z.string()),
  type: z.string(),
  byDay: optionalDefaultSchema(
    z.union([z.boolean(), z.literal("filter")]),
    false,
  ),
  features: optionalDefaultSchema(z.array(z.string()), []),
})

const pageConfigSchema = z.looseObject({
  name: optional(z.string()),
  description: optional(z.string()),
  types: optionalDefaultSchema(z.array(z.string()), []),
  requireTags: optionalDefaultSchema(z.array(z.array(z.string())), []),
  excludeTags: optionalDefaultSchema(z.array(z.array(z.string())), []),
  views: optionalDefaultSchema(
    z.record(z.string(), omitUndefSchema(viewConfigSchema)),
    {},
  ),
})

const configSchema = z.looseObject({
  id: z.string(),
  name: optional(z.string()),
  description: optional(z.string()),
  timeZone: z.string(),
  dayChangeHour: z.int(),
  tags: optional(z.record(z.string(), omitUndefSchema(tagConfigSchema))),
  pages: optionalDefaultSchema(
    z.record(z.string(), omitUndefSchema(pageConfigSchema)),
    {},
  ),
  items: optional(z.array(z.unknown())),
})

export const parseConfig = (data: unknown): ViewerConfig => {
  const parsed = omitUndef(configSchema.parse(data))

  const pages: Record<string, PageConfig> = {}

  for (const [pageId, pageCfg] of Object.entries(parsed.pages)) {
    const views: Record<string, ViewConfig> = {}

    for (const [viewId, viewCfg] of Object.entries(pageCfg.views)) {
      views[viewId] = {
        name: viewId,
        ...viewCfg,
        id: viewId,
        type: viewCfg.type as ScheduleViewType,
        features: new Set(viewCfg.features) as Set<SchedulePageFeature>,
      }
    }

    pages[pageId] = {
      name: pageId,
      ...pageCfg,
      id: pageId,
      types: new Set(pageCfg.types) as Set<ScheduleItemType>,
      requireTags: pageCfg.requireTags.map((t) => new Set(t)),
      excludeTags: pageCfg.excludeTags.map((t) => new Set(t)),
      views,
    }
  }

  const config = {
    ...DEFAULT_CONFIG,
    ...parsed,
    tags: makeTagsConfig(parsed),
    pages,
  }
  return config
}
