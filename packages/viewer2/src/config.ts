/**
 * Viewer configuration.
 */

import {
  DEFAULT_SCHEDULE_CONFIG,
  parseConfig,
  type ScheduleConfig,
  type ScheduleConfigInput,
  type SchedulePageFeature,
} from "@open-event-systems/schedule-react"
import z from "zod"
import wretch from "wretch"
import { createContext, use } from "react"
import {
  parseMapConfig,
  type MapConfig,
} from "@open-event-systems/schedule-map"
import type { ScheduleViewComponentType } from "./types.js"

export type ViewConfig = Readonly<{
  id: string
  type: ScheduleViewComponentType
  title: string
  enableFeatures?: readonly SchedulePageFeature[]
}> &
  Readonly<Record<string, unknown>>

export type PageConfig = Readonly<{
  id: string
  title?: string
  description?: string
  views?: readonly ViewConfig[]
  onlyType?: readonly string[]
  requireTags?: readonly string[]
  noPastEventsOption?: boolean
}>

export type ViewerConfig = ScheduleConfig &
  Readonly<{
    homeURL?: string
    pages: readonly PageConfig[]
    map?: MapConfig
  }>

const opt = <OutT, InT>(
  s: z.ZodType<OutT, InT>,
): z.ZodType<OutT | undefined, InT | null | undefined> =>
  s.nullish().transform((v) => v ?? undefined)

const viewConfigSchema = z
  .looseObject({
    id: z.string(),
    title: opt(z.string()).optional(),
    type: z.string().transform((s) => s as ScheduleViewComponentType),
    enableFeatures: opt(
      z.array(z.string().transform((s) => s as SchedulePageFeature)),
    ).optional(),
  })
  .transform((v) => {
    const { title, id, ...other } = v
    return {
      id,
      title: title ?? id,
      ...other,
    }
  })

const pageConfigSchema = z
  .looseObject({
    id: z.string(),
    title: opt(z.string()).optional(),
    description: opt(z.string()).optional(),
    views: opt(z.array(viewConfigSchema)).optional(),
    onlyType: opt(
      z.union([z.string().transform((s) => [s]), z.array(z.string())]),
    ).optional(),
    requireTags: opt(z.array(z.string())).optional(),
    noPastEventsOption: opt(z.boolean()).optional(),
  })
  .partial()
  .required({ id: true })

const viewerConfigSchema = z
  .object({
    homeURL: opt(z.string()),
    pages: opt(z.array(pageConfigSchema)),
  })
  .partial()

export const DEFAULT_VIEWER_CONFIG = {
  ...DEFAULT_SCHEDULE_CONFIG,
  pages: [],
} as const satisfies ViewerConfig

export const loadConfig = async (url: string): Promise<ViewerConfig> => {
  const data = await wretch(url).get().json<ScheduleConfigInput>()
  return parseViewerConfig(data)
}

export const ViewerConfigContext = createContext<ViewerConfig>(
  DEFAULT_VIEWER_CONFIG,
)
export const useViewerConfig = (): ViewerConfig => use(ViewerConfigContext)

export const parseViewerConfig = (configData: unknown): ViewerConfig => {
  const config = parseConfig(configData)
  const viewerConfig = viewerConfigSchema.parse(configData)
  const mapConfig =
    typeof configData == "object" && configData && "map" in configData
      ? parseMapConfig(configData.map)
      : undefined

  return {
    ...DEFAULT_VIEWER_CONFIG,
    ...config,
    ...viewerConfig,
    ...(mapConfig && { map: mapConfig }),
  }
}
