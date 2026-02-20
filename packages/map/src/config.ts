import z from "zod"
import type { MapConfig } from "./types.js"

const objectSchema = z.looseObject({
  url: z.string(),
  type: z.string().optional(),
  noIsometricTransform: z.boolean().optional(),
})

const levelSchema = objectSchema.extend({
  id: z.string(),
  type: z.literal("level"),
  title: z.string(),
})

const levelOrObjectSchema = z.union([levelSchema, objectSchema])

const layerSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
})

const locationSchema = z.looseObject({
  id: z.string(),
  level: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  zoomScale: z.number().optional(),
})

const configSchema = z.looseObject({
  objects: z.array(levelOrObjectSchema),
  defaultLevel: z.string(),
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

export type MapConfigInput = z.input<typeof configSchema>

/**
 * Parse a {@link MapConfig}.
 */
export const parseMapConfig = (data: unknown): MapConfig => {
  return configSchema.parse(data)
}
