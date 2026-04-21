import z from "zod"
import { type MapConfig, type MapLocation } from "./types.js"
import { omitUndef, optional } from "@open-event-systems/schedule-lib"

const objectSchema = z.looseObject({
  url: z.string(),
  type: optional(z.string()),
  noIsometricTransform: optional(z.boolean()),
})

const levelSchema = z.looseObject({
  ...objectSchema.shape,
  id: z.string(),
  type: z.literal("level"),
  title: z.string(),
})

const levelOrObjectSchema = z.union([levelSchema, objectSchema])

const layerSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
})

const flagToggleSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
})

const locationSchema = z.codec(
  z.looseObject({
    id: z.string(),
    level: z.string(),
    title: optional(z.string()),
    description: optional(z.string()),
    aliases: optional(z.array(z.string())),
    zoomScale: optional(z.number()),
    requireFlags: optional(z.array(z.string())),
    excludeFlags: optional(z.array(z.string())),
  }),
  z.custom<MapLocation>(),
  {
    decode: ({ requireFlags, excludeFlags, ...v }) => ({
      ...v,
      requireFlags: requireFlags ?? [],
      excludeFlags: excludeFlags ?? [],
    }),
    encode: ({ requireFlags, aliases, excludeFlags, ...v }) => ({
      ...v,
      aliases: [...(aliases ?? [])],
      requireFlags: [...requireFlags],
      excludeFlags: [...excludeFlags],
    }),
  },
)

const configSchema = z.looseObject({
  objects: z.array(levelOrObjectSchema),
  defaultLevel: z.string(),
  layers: optional(z.array(layerSchema)),
  locations: optional(z.array(locationSchema)),
  flagToggles: optional(z.array(flagToggleSchema)),
  width: z.number(),
  height: z.number(),
  homeURL: optional(z.string()),
})

export type MapConfigInput = z.input<typeof configSchema>

/**
 * Parse a {@link MapConfig}.
 */
export const parseMapConfig = (data: unknown): MapConfig => {
  const parsed = configSchema.parse(data)
  return {
    layers: [],
    locations: [],
    flagToggles: [],
    ...omitUndef(parsed),
  }
}
