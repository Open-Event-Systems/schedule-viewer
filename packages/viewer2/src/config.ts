import {
  DEFAULT_SCHEDULE_CONFIG,
  isScheduleViewType,
  parseConfig,
  type ScheduleConfig,
  type ScheduleConfigInput,
  type ScheduleViewType,
} from "@open-event-systems/schedule-react"
import z from "zod"
import wretch from "wretch"
import { createContext, use } from "react"
import {
  parseMapConfig,
  type MapConfig,
} from "@open-event-systems/schedule-map"

export type PageConfig = Readonly<{
  id: string
  title?: string
  description?: string
  enabledViews?: readonly string[]
  onlyType?: string | readonly string[]
  requireTags?: readonly string[]
  noPastEventsOption?: boolean
}>

export type ViewerConfig = ScheduleConfig &
  Readonly<{
    pages: readonly PageConfig[]
    map?: MapConfig
  }>

const opt = <OutT, InT>(
  s: z.ZodType<OutT, InT>,
): z.ZodType<OutT | undefined, InT | null | undefined> =>
  s.nullish().transform((v) => v ?? undefined)

const pageSchema = z.looseObject({
  id: z.string(),
  title: opt(z.string()).optional(),
  description: opt(z.string()).optional(),
  enabledViews: opt(z.array(z.string())).optional(),
  onlyType: opt(z.union([z.string(), z.array(z.string())])).optional(),
  requireTags: opt(z.array(z.string())).optional(),
  noPastEventsOption: opt(z.boolean()).optional(),
})

const pageConfigSchema = z
  .looseObject({
    pages: opt(z.array(pageSchema)),
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

const parseViewerConfig = (configData: ScheduleConfigInput): ViewerConfig => {
  const config = parseConfig(configData)
  const viewerConfig = pageConfigSchema.parse(configData)
  const mapConfig =
    "map" in configData ? parseMapConfig(configData.map) : undefined

  return {
    ...DEFAULT_VIEWER_CONFIG,
    ...config,
    ...viewerConfig,
    ...(mapConfig && { map: mapConfig }),
  }
}

const defaultEnabled = [
  "daily-agenda",
  "full-agenda",
  "catalog",
  "tags",
] as const satisfies readonly ScheduleViewType[]

export const getEnabledScheduleViewTypes = (
  enabled?: Iterable<string>,
): ScheduleViewType[] => {
  const items = [...(enabled ?? defaultEnabled)]
  return items.filter(isScheduleViewType)
}

export const getValidScheduleViewType = (
  enabled: Iterable<string> | undefined,
  input: string | undefined,
) => {
  const enabledItems = getEnabledScheduleViewTypes(enabled)
  if (isScheduleViewType(input) && enabledItems.includes(input)) {
    return input
  } else {
    return enabledItems[0] ?? "daily-agenda"
  }
}
