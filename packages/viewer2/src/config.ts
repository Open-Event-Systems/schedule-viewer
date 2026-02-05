import {
  DEFAULT_SCHEDULE_CONFIG,
  parseConfig,
  type ScheduleConfig,
  type ScheduleConfigInput,
} from "@open-event-systems/schedule-react"
import z from "zod"
import wretch from "wretch"
import { createContext, use } from "react"

export type PageConfig = Readonly<{
  id: string
}>

export type ViewerConfig = ScheduleConfig &
  Readonly<{
    pages: readonly PageConfig[]
  }>

const opt = <OutT, InT>(
  s: z.ZodType<OutT, InT>,
): z.ZodType<OutT | undefined, InT | null | undefined> =>
  s.nullish().transform((v) => v ?? undefined)

const pageSchema = z.looseObject({
  id: z.string(),
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
  return {
    ...DEFAULT_VIEWER_CONFIG,
    ...config,
    ...viewerConfig,
  }
}
