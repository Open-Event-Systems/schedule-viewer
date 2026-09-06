import { optional } from "@open-event-systems/schedule-lib"
import z from "zod"
import { DEFAULT_CONFIG, type ViewerConfig } from "./config.js"

const tagConfigSchema = z.looseObject({
  value: z.string(),
  label: optional(z.string()),
  color: optional(z.union([z.string(), z.array(z.string())])),
  indicator: optional(z.string()),
  indicatorColor: optional(z.string()),
  textColor: optional(z.string()),
  before: optional(z.string()),
  after: optional(z.string()),
})

const configSchema = z.looseObject({
  id: z.string(),
  timeZone: z.string(),
  dayChangeHour: z.int(),
  tags: optional(z.array(tagConfigSchema)),
  items: optional(z.array(z.unknown())),
})


export const parseConfig = (data: unknown): ViewerConfig => {
  const parsed = configSchema.parse(data)
  return {
    ...DEFAULT_CONFIG,
    ...parsed,
  }
}
