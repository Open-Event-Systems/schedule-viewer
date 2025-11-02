import z from "zod"
import type { MapConfig } from "./types.js"

const levelSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
  url: z.string(),
})

const layerSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
})

const configSchema = z.looseObject({
  levels: z.array(levelSchema),
  layers: z.array(layerSchema),
  width: z.number(),
  height: z.number(),
  homeURL: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined)
    .optional(),
})

/**
 * Parse a {@link MapConfig}.
 */
export const parseMapConfig = (data: unknown): MapConfig => {
  return configSchema.parse(data)
}
