import { isBefore } from "date-fns"
import { Interval } from "./types.js"
import { contains } from "./time.js"
import { Contact, ScheduleEvent, ScheduleItem, Vendor } from "./types.js"
import { opt, optStr, strDate, strSetSchema } from "./schema.js"
import z from "zod"
import { ScheduleItemStore } from "./item-store.js"

const contactObjSchema = z
  .looseObject({
    name: optStr,
    url: optStr,
  })
  .partial()

const contactSchema = z
  .union([z.string(), contactObjSchema])
  .transform((v): Contact & { [x: string]: unknown } => {
    if (typeof v == "string") {
      return {
        name: v,
      }
    }
    return v
  })

const itemDetailsSchema = z
  .looseObject({
    title: optStr,
    description: optStr,
    location: optStr,
    contacts: opt(z.array(contactSchema).readonly()),
    tags: opt(strSetSchema),
    icon: optStr,
    image: optStr,
  })
  .partial()

const scheduleItemSchema = z
  .looseObject({
    id: z.string(),
    type: z.string(),
    start: strDate,
    end: strDate,
  })
  .partial({ start: true, end: true })

const scheduleEventSchema = z.looseObject({
  ...scheduleItemSchema.shape,
  ...itemDetailsSchema.shape,
  type: z.literal("event"),
})

const vendorSchema = z.looseObject({
  ...scheduleItemSchema.shape,
  ...itemDetailsSchema.shape,
  type: z.literal("vendor"),
})

/**
 * Parse a {@link ScheduleItem}.
 */
export const parseScheduleItem = (
  data: unknown,
):
  | { success: true; data: ScheduleItem }
  | { success: false; error: string } => {
  const res = scheduleItemSchema.safeParse(data)
  if (res.success) {
    return { success: true, data: res.data }
  } else {
    return { success: false, error: z.prettifyError(res.error) }
  }
}

/**
 * Parse a {@link ScheduleEvent}.
 */
export const parseScheduleEvent = (
  data: unknown,
):
  | { success: true; data: ScheduleEvent }
  | { success: false; error: string } => {
  const res = scheduleEventSchema.safeParse(data)
  if (res.success) {
    return { success: true, data: res.data }
  } else {
    return { success: false, error: z.prettifyError(res.error) }
  }
}

/**
 * Parse a {@link Vendor}.
 */
export const parseVendor = (
  data: unknown,
): { success: true; data: Vendor } | { success: false; error: string } => {
  const res = vendorSchema.safeParse(data)
  if (res.success) {
    return { success: true, data: res.data }
  } else {
    return { success: false, error: z.prettifyError(res.error) }
  }
}

export const makeScheduleEventStore = (
  store: ScheduleItemStore,
): ScheduleItemStore<ScheduleEvent> => {
  return store
    .filter((item) => item.type == "event")
    .map((item) => {
      const parsed = parseScheduleEvent(item)
      if (parsed.success) {
        return parsed.data
      } else {
        console.error(
          `error parsing schedule item as event:\n${parsed.error}`,
          item,
        )
      }
    })
}

export const makeVendorStore = (
  store: ScheduleItemStore,
): ScheduleItemStore<Vendor> => {
  return store
    .filter((item) => item.type == "vendor")
    .map((item) => {
      const parsed = parseVendor(item)
      if (parsed.success) {
        return parsed.data
      } else {
        console.error(
          `error parsing schedule item as vendor:\n${parsed.error}`,
          item,
        )
      }
    })
}

/**
 * Return a filter for items matching the given search string.
 */
export const makeTitleFilter = (
  title: string,
): (<T extends { readonly title?: string }>(
  event: T,
) => event is T & { readonly title: string }) => {
  const lowerTitle = title.trim().toLowerCase()
  return <T extends { readonly title?: string }>(
    event: T,
  ): event is T & { readonly title: string } =>
    !!event.title && event.title.toLowerCase().includes(lowerTitle)
}

/**
 * Return a filter for events not containing disabled tags.
 */
export const makeTagFilter = (
  tags: Iterable<string>,
): ((event: { readonly tags?: ReadonlySet<string> }) => boolean) => {
  const tagsArr = [...tags]
  return (event) => !tagsArr.some((t) => event.tags && event.tags.has(t))
}

/**
 * Return a filter for events that have not passed.
 */
export const makePastItemFilter = (
  now: Date,
): (<T extends { readonly end?: Date }>(
  event: T,
) => event is T & { readonly end: Date }) => {
  return <T extends { readonly end?: Date }>(
    event: T,
  ): event is T & { readonly end: Date } =>
    !event.end || isBefore(now, event.end)
}

/**
 * Get a filter function for events beginning in the given {@link Interval}.
 */
export const makeDateFilter = (
  range: Interval,
): (<T extends { readonly start?: Date }>(
  event: T,
) => event is T & { readonly start: Date }) => {
  return <T extends { readonly start?: Date }>(
    e: T,
  ): e is T & { readonly start: Date } => {
    if (!e.start) {
      return false
    }
    return contains(range, e.start)
  }
}
