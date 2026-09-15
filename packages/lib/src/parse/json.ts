/**
 * JSON parsing.
 * @module
 */

import {
  arrToSetSchema,
  isoDateTimeSchema,
  isoDurationSchema,
  omitUndefSchema,
  optional,
  optionalDefaultSchema,
} from "#src/schema.js"
import {
  ContactRole,
  ScheduleEventStatus,
  type Amenity,
  type Location,
  type Parser,
  type ParseResult,
  type Profile,
  type ScheduleEvent,
  type ScheduleItem,
  type ScheduleItemSeries,
  type Vendor,
} from "#src/types.js"
import type { OmitUndef } from "#src/utils.js"
import z from "zod"

export const imageObjectSchema = z.looseObject({
  url: z.string(),
  mediaType: optional(z.string()),
  width: optional(z.int()),
  height: optional(z.int()),
})

export const imageSchema = z.codec(
  z.custom<z.input<typeof imageObjectSchema> | string>(),
  omitUndefSchema(imageObjectSchema),
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

const typeSchema = z.looseObject({
  type: z.string(),
})

export const basePropsSchema = z.looseObject({
  id: z.string(),
  type: z.string(),
  name: optional(z.string()),
  alternateNames: optionalDefaultSchema(z.array(z.string()), []),
  description: optional(z.string()),
  images: optionalDefaultSchema(z.array(imageSchema), []),
  tags: optionalDefaultSchema(arrToSetSchema(z.array(z.string())), new Set()),
  urls: optionalDefaultSchema(z.array(z.string()), []),
})

export const contactRoleSchema = z.literal(Object.values(ContactRole))

export const contactSchema = z
  .looseObject({
    role: optionalDefaultSchema(contactRoleSchema, ContactRole.performer),
  })
  .and(
    z.union([
      z.looseObject({
        id: z.string(),
      }),
      z.looseObject({
        name: z.string(),
      }),
    ]),
  )

export const eventStatusSchema = z.literal(Object.values(ScheduleEventStatus))

export const eventSchema = omitUndefSchema(
  z.looseObject({
    ...basePropsSchema.shape,
    type: z.literal("event"),
    eventStatus: optionalDefaultSchema(
      eventStatusSchema,
      ScheduleEventStatus.scheduled,
    ),
    contacts: optionalDefaultSchema(z.array(contactSchema), []),
  }),
)

export const vendorSchema = omitUndefSchema(
  z.looseObject({
    ...basePropsSchema.shape,
    type: z.literal("vendor"),
    email: optional(z.string()),
    logo: optional(imageSchema),
  }),
)

export const profileSchema = omitUndefSchema(
  z.looseObject({
    ...basePropsSchema.shape,
    type: z.literal("profile"),
    email: optional(z.string()),
    logo: optional(imageSchema),
  }),
)

export const amenitySchema = omitUndefSchema(
  z.looseObject({
    ...basePropsSchema.shape,
    type: z.literal("amenity"),
  }),
)

export const addressSchema = z.looseObject({
  streetAddress: optional(z.string()),
  extendedAddress: optional(z.string()),
  postOfficeBoxNumber: optional(z.string()),
  addressLocality: optional(z.string()),
  addressRegion: optional(z.string()),
  addressCountry: optional(z.string()),
  postalCode: optional(z.string()),
})

export const locationSchema = omitUndefSchema(
  z.looseObject({
    ...basePropsSchema.shape,
    type: z.literal("location"),
    address: optional(omitUndefSchema(addressSchema)),
  }),
)

export const scheduleItemSchema = z.codec(
  z.custom<
    | z.input<typeof eventSchema>
    | z.input<typeof vendorSchema>
    | z.input<typeof profileSchema>
    | z.input<typeof amenitySchema>
    | z.input<typeof locationSchema>
  >(),
  z.custom<
    OmitUndef<
      | z.output<typeof eventSchema>
      | z.output<typeof vendorSchema>
      | z.output<typeof profileSchema>
      | z.output<typeof amenitySchema>
      | z.output<typeof locationSchema>
    >
  >(),
  {
    decode: (v, ctx) => {
      const typeRes = typeSchema.safeParse(v)
      if (!typeRes.success) {
        for (const issue of typeRes.error.issues) {
          ctx.issues.push(issue as z.core.$ZodRawIssue)
        }
        return z.NEVER
      }

      let parseResult

      switch (typeRes.data.type) {
        case "event":
          parseResult = eventSchema.safeParse(v)
          break
        case "vendor":
          parseResult = vendorSchema.safeParse(v)
          break
        case "profile":
          parseResult = profileSchema.safeParse(v)
          break
        case "amenity":
          parseResult = amenitySchema.safeParse(v)
          break
        case "location":
          parseResult = locationSchema.safeParse(v)
          break
        default:
          ctx.issues.push({
            code: "invalid_value",
            input: typeRes.data.type,
            values: ["event", "vendor", "profile", "amenity", "location"],
            message: `unsupported type: ${typeRes.data.type}`,
          })
          return z.NEVER
      }

      if (!parseResult.success) {
        for (const issue of parseResult.error.issues) {
          ctx.issues.push(issue as z.core.$ZodRawIssue)
        }
        return z.NEVER
      }

      return parseResult.data
    },
    encode: (v) => {
      switch (v.type) {
        case "event":
          return eventSchema.encode(v)
        case "vendor":
          return vendorSchema.encode(v)
        case "profile":
          return profileSchema.encode(v)
        case "amenity":
          return amenitySchema.encode(v)
        case "location":
          return locationSchema.encode(v)
      }
    },
  },
)

export const occurrenceLocationSchema = z.union([
  z.looseObject({
    id: z.string(),
  }),
  z.looseObject({
    name: z.string(),
  }),
])

export const dateInfoSchema = z.looseObject({
  startDate: optional(isoDateTimeSchema),
  endDate: optional(isoDateTimeSchema),
  duration: optional(isoDurationSchema),
})

export const occurrenceSchema = z.looseObject({
  ...dateInfoSchema.shape,
  id: z.string(),
  eventStatus: optionalDefaultSchema(
    eventStatusSchema,
    ScheduleEventStatus.scheduled,
  ),
  locations: optionalDefaultSchema(
    z.array(omitUndefSchema(occurrenceLocationSchema)),
    [],
  ),
})

export const scheduleItemSeriesSchema = omitUndefSchema(
  z.looseObject({
    item: z.unknown(),
    occurrences: optionalDefaultSchema(
      z.array(omitUndefSchema(occurrenceSchema)),
      [],
    ),
  }),
)

/**
 * Parse a {@link ScheduleItem}
 */
export const parseScheduleItem = (
  data: unknown,
): ParseResult<ScheduleEvent | Vendor | Amenity | Profile | Location> => {
  const res = scheduleItemSchema.safeParse(data)
  if (!res.success) {
    return {
      ...res,
      message: z.prettifyError(res.error),
    }
  }
  return res
}

/**
 * Parse a {@link ScheduleItemSeries} using the given {@link ScheduleItem}
 * parser.
 */
export const parseScheduleItemSeries = (
  itemParser: Parser<ScheduleItem>,
  data: unknown,
): ParseResult<ScheduleItemSeries> => {
  const occResult = scheduleItemSeriesSchema.safeParse(data)
  if (!occResult.success) {
    return {
      ...occResult,
      message: z.prettifyError(occResult.error),
    }
  }

  const parseResult = itemParser(occResult.data.item)
  if (!parseResult.success) {
    return parseResult
  }

  return {
    success: true,
    data: {
      ...occResult.data,
      item: parseResult.data,
    },
  }
}
