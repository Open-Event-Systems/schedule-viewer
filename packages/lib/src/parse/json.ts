/**
 * Tools for parsing {@link ScheduleItem} objects from JSON.
 * @module
 */

import z from "zod"
import {
  isoDateTimeSchema,
  omitUndefSchema,
  optional,
  setSchema,
} from "../schema.js"
import {
  type ParseResult,
  type RW,
  type ScheduleEvent,
  type ScheduleEventStatus,
  type ScheduleItem,
} from "../types.js"
import {
  EVENT_TYPES,
  getJSONLDTypesFromHierarchy,
  ORGANIZATION_TYPES,
} from "../ld.js"

export const ldArray = <OutT, InT>(
  ofSchema: z.ZodType<OutT, InT>,
): z.ZodCodec<
  z.ZodType<OutT | OutT[], InT | InT[]>,
  z.ZodType<OutT[], OutT[]>
> =>
  z.codec(z.union([ofSchema, z.array(ofSchema)]), z.custom<OutT[]>(), {
    decode: (v) => {
      if (Array.isArray(v)) {
        return v
      } else {
        return [v]
      }
    },
    encode: (v) => {
      if (v.length == 1) {
        return v[0]!
      } else {
        return v
      }
    },
  })

export const imageObjectSchema = omitUndefSchema(
  z.looseObject({
    type: z.literal("ImageObject"),
    contentUrl: optional(z.string()),
    caption: optional(z.string()),
    width: optional(z.number()),
    height: optional(z.number()),
    encodingFormat: optional(z.string()),
  }),
)

export const baseScheduleItemPropsSchema = z.looseObject({
  id: optional(z.string()),
  identifier: optional(z.string()),
  type: z.string(),
  name: optional(z.string()),
  description: optional(z.string()),
  image: optional(ldArray(z.union([z.string(), imageObjectSchema]))),
  sameAs: optional(ldArray(z.string())),
  url: optional(z.string()),
})

export const personSchema = omitUndefSchema(
  z.looseObject({
    ...baseScheduleItemPropsSchema.shape,
    type: z.literal("Person"),
    email: optional(z.string()),
    keywords: optional(setSchema(z.string())),
    logo: optional(ldArray(z.union([z.string(), imageObjectSchema]))),
  }),
)

export const organizationSchema = omitUndefSchema(
  z.looseObject({
    ...baseScheduleItemPropsSchema.shape,
    type: z.literal(getJSONLDTypesFromHierarchy(ORGANIZATION_TYPES)),
    email: optional(z.string()),
    keywords: optional(setSchema(z.string())),
    logo: optional(ldArray(z.union([z.string(), imageObjectSchema]))),
  }),
)

export const addressSchema = omitUndefSchema(
  z.looseObject({
    ...baseScheduleItemPropsSchema.shape,
    type: z.literal("PostalAddress"),
    addressCountry: optional(z.string()),
    addressLocality: optional(z.string()),
    addressRegion: optional(z.string()),
    extendedAddress: optional(z.string()),
    postOfficeBoxNumber: optional(z.string()),
    postalCode: optional(z.string()),
    streetAddress: optional(z.string()),
  }),
)

const lazyEvent = z.lazy((): z.ZodType<RW<ScheduleEvent>> => eventSchema)

export const placeSchema = omitUndefSchema(
  z.looseObject({
    ...baseScheduleItemPropsSchema.shape,
    type: z.literal("Place"),
    address: optional(z.union([z.string(), addressSchema])),
    event: optional(ldArray(z.union([z.string(), lazyEvent]))),
  }),
)

export const eventStatusSchema = z.codec(
  z.literal([
    "EventScheduled",
    "EventCancelled",
    "http://schema.org/EventScheduled",
    "http://schema.org/EventCancelled",
    "https://schema.org/EventScheduled",
    "https://schema.org/EventCancelled",
  ]),
  z.custom<ScheduleEventStatus>(),
  {
    decode: (v) => {
      if (v.endsWith("EventCancelled")) {
        return "EventCancelled"
      } else {
        return "EventScheduled"
      }
    },
    encode: (v): `http://schema.org/${ScheduleEventStatus}` => {
      return `http://schema.org/${v}`
    },
  },
)

export const eventSchema = omitUndefSchema(
  z.looseObject({
    type: z.literal(getJSONLDTypesFromHierarchy(EVENT_TYPES)),
    status: optional(eventStatusSchema).default("EventScheduled"),
    startDate: optional(isoDateTimeSchema),
    endDate: optional(isoDateTimeSchema),
    location: optional(
      ldArray(z.union([z.string(), placeSchema, addressSchema])),
    ),
    organizer: optional(ldArray(z.union([personSchema, organizationSchema]))),
    performer: optional(ldArray(z.union([personSchema, organizationSchema]))),
    keywords: optional(setSchema(z.string())),
    superEvent: optional(z.union([z.string(), lazyEvent])),
    subEvent: optional(ldArray(z.union([z.string(), lazyEvent]))),
  }),
)

export const scheduleItemSchema = z.union([
  eventSchema,
  personSchema,
  organizationSchema,
  addressSchema,
  placeSchema,
])

export const parseScheduleItems = function* (
  items: Iterable<unknown>,
): Generator<ParseResult<ScheduleItem>, void, never> {
  for (const item of items) {
    yield parseScheduleItem(item)
  }
}

export const parseScheduleItem = (data: unknown): ParseResult<ScheduleItem> => {
  const res = scheduleItemSchema.safeParse(data)
  if (res.success) {
    return res
  } else {
    const message = z.prettifyError(res.error)
    return { ...res, message }
  }
}
