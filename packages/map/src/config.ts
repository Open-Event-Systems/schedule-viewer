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

const locationSchema = z.looseObject({
  id: z.string(),
  level: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
})

const configSchema = z.looseObject({
  levels: z.array(levelSchema),
  layers: z.array(layerSchema),
  locations: z.array(locationSchema),
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
