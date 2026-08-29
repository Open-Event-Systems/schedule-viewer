/**
 * JSON parsing.
 * @module
 */

import z from "zod"
import {
  isoDateTimeSchema,
  isoDurationSchema,
  omitUndefSchema,
  optional,
  optStrSchema,
  setSchema,
  trimStrSchema,
} from "../schema.js"
import {
  ScheduleEventStatus,
  type Amenity,
  type Location,
  type Parser,
  type ParseResult,
  type Profile,
  type ScheduleEvent,
  type ScheduleObject,
  type Vendor,
} from "../types.js"

const reqStr = trimStrSchema(z.string()).superRefine((arg, ctx) => {
  if (arg == "") {
    ctx.addIssue({
      code: "too_small",
      origin: "string",
      minimum: 1,
      message: "Invalid id",
    })
  }
})
const optStr = optional(optStrSchema(trimStrSchema(z.string())))

export const imageObjectSchema = omitUndefSchema(
  z.looseObject({
    url: reqStr,
    mediaType: optStr,
    width: z.optional(z.int()),
    height: z.optional(z.int()),
  }),
)

export const imageSchema = z.codec(
  z.custom<z.input<typeof imageObjectSchema> | string>(),
  imageObjectSchema,
  {
    decode: (v) => {
      if (typeof v == "string") {
        return { url: v }
      } else {
        return v
      }
    },
    encode: (v) => {
      return v
    },
  },
)

export const occurrenceSchema = omitUndefSchema(
  z.looseObject({
    id: reqStr,
    startDate: optional(isoDateTimeSchema),
    endDate: optional(isoDateTimeSchema),
    duration: optional(isoDurationSchema),
    locations: optional(z.array(z.string())),
  }),
)

const baseObjectSchema = z.looseObject({
  type: reqStr,
})

export const basePropsSchema = z.looseObject({
  id: reqStr,
  type: reqStr,
  name: optStr,
  alternateNames: optional(z.array(z.string())),
  description: optStr,
  images: optional(z.array(imageSchema)),
  tags: optional(setSchema(z.string())),
  startDate: optional(isoDateTimeSchema),
  endDate: optional(isoDateTimeSchema),
  duration: optional(isoDurationSchema),
  locations: optional(z.array(z.string())),
  occurrences: optional(z.array(occurrenceSchema)),
})

export const eventSchema = omitUndefSchema(
  z.looseObject({
    ...basePropsSchema.shape,
    type: z.literal("event"),
    eventStatus: optional(
      z.literal([ScheduleEventStatus.scheduled, ScheduleEventStatus.canceled]),
    ),
    organizers: optional(z.array(z.string())),
    performers: optional(z.array(z.string())),
  }),
)

export const vendorSchema = omitUndefSchema(
  z.looseObject({
    ...basePropsSchema.shape,
    type: z.literal("vendor"),
    email: optStr,
    logo: optional(imageSchema),
    urls: optional(z.array(z.string())),
  }),
)

export const profileSchema = omitUndefSchema(
  z.looseObject({
    ...basePropsSchema.shape,
    type: z.literal("profile"),
    email: optStr,
    logo: optional(imageSchema),
    urls: optional(z.array(z.string())),
  }),
)

export const amenitySchema = omitUndefSchema(
  z.looseObject({
    ...basePropsSchema.shape,
    type: z.literal("amenity"),
  }),
)

export const addressSchema = omitUndefSchema(
  z.looseObject({
    streetAddress: optStr,
    extendedAddress: optStr,
    postOfficeBoxNumber: optStr,
    addressLocality: optStr,
    addressRegion: optStr,
    addressCountry: optStr,
    postalCode: optStr,
  }),
)

export const locationSchema = omitUndefSchema(
  z.looseObject({
    ...basePropsSchema.shape,
    type: z.literal("location"),
    address: optional(addressSchema),
  }),
)

type ParseTypeMap = {
  readonly [key: string]: ScheduleObject
}

type ParseConfig<M extends ParseTypeMap> = {
  readonly [K in keyof M]: Parser<M[K]>
}

export const makeParser = <M extends ParseTypeMap>(
  config: ParseConfig<M>,
): Parser<M[keyof M]> => {
  const parser = (item: unknown): ParseResult<M[keyof M]> => {
    const asObjResult = baseObjectSchema.safeParse(item)
    if (!asObjResult.success) {
      return asObjResult
    }

    const typeParser = config[asObjResult.data.type]
    if (!typeParser) {
      return {
        success: false,
        message: `Unknown object type: ${asObjResult.data.type}`,
      }
    }

    return typeParser(asObjResult.data)
  }

  return parser
}

const schemaParser = <T>(
  s: z.ZodType<T>,
): ((obj: unknown) => ParseResult<T>) => {
  return (obj) => s.safeParse(obj)
}

export const defaultParserConfig = {
  event: schemaParser<ScheduleEvent>(eventSchema),
  vendor: schemaParser<Vendor>(vendorSchema),
  profile: schemaParser<Profile>(profileSchema),
  amenity: schemaParser<Amenity>(amenitySchema),
  location: schemaParser<Location>(locationSchema),
} as const
