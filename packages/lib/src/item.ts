import { isBefore } from "date-fns"
import { contains } from "./time.js"
import type {
  Interval,
  Contact,
  ScheduleEvent,
  ScheduleItem,
  Vendor,
  ParseResult,
  Parser,
  MapFlag,
} from "./types.js"
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

const mapFlagSchema = z.looseObject({
  ...scheduleItemSchema.shape,
  type: z.literal("map-flag"),
})

/**
 * Parse a {@link ScheduleItem}.
 */
export const parseScheduleItem = (data: unknown): ParseResult<ScheduleItem> => {
  const res = scheduleItemSchema.safeParse(data)
  if (res.success) {
    return { success: true, value: res.data }
  } else {
    return { success: false, error: z.prettifyError(res.error) }
  }
}

/**
 * Parse a {@link ScheduleEvent}.
 */
export const parseScheduleEvent = (
  data: unknown,
): ParseResult<ScheduleEvent> => {
  const res = scheduleEventSchema.safeParse(data)
  if (res.success) {
    return { success: true, value: res.data }
  } else {
    return { success: false, error: z.prettifyError(res.error) }
  }
}

/**
 * Parse a {@link Vendor}.
 */
export const parseVendor = (data: unknown): ParseResult<Vendor> => {
  const res = vendorSchema.safeParse(data)
  if (res.success) {
    return { success: true, value: res.data }
  } else {
    return { success: false, error: z.prettifyError(res.error) }
  }
}

/**
 * Parse a {@link MapFlag}.
 */
export const parseMapFlag = (data: unknown): ParseResult<MapFlag> => {
  const res = mapFlagSchema.safeParse(data)
  if (res.success) {
    return { success: true, value: res.data }
  } else {
    return { success: false, error: z.prettifyError(res.error) }
  }
}

export type ItemTypeMap = {
  readonly [type: string]: ScheduleItem
}

export type ItemParserMap<M extends ItemTypeMap> = {
  readonly [T in keyof M]: Parser<M[T], ScheduleItem>
}

export type ParseItemResult<M extends ItemTypeMap> = ParseResult<M[keyof M]>

export type ParseItemsResult<M extends ItemTypeMap> = {
  readonly [T in keyof M]: ScheduleItemStore<M[T]>
}

/**
 * Parse a {@link ScheduleItem} using the provided parsers.
 */
export const parseItemType = <M extends ItemTypeMap>(
  typeParsers: ItemParserMap<M>,
  item: ScheduleItem,
): ParseItemResult<M> => {
  const parser = typeParsers[item.type]
  if (!parser) {
    return { success: false, error: `Unknown item type: ${item.type}` }
  }

  return parser(item)
}

/**
 * Parse an iterable of {@link ScheduleItem} using the provided parsers.
 *
 * The provided iterable should be sorted.
 */
export const parseItems = <M extends ItemTypeMap>(
  typeParsers: ItemParserMap<M>,
  items: Iterable<ScheduleItem>,
): ParseItemsResult<M> => {
  const results: Record<string, ScheduleItem[]> = {}

  for (const key of Object.keys(typeParsers)) {
    results[key] = []
  }

  for (const value of items) {
    const res = parseItemType(typeParsers, value)
    if (res.success) {
      const arr = results[res.value.type]
      if (arr) {
        arr.push(res.value)
      }
    } else {
      console.error(`Failed to parse schedule item:\n${res.error}`, value)
    }
  }

  const stores: Record<string, ScheduleItemStore> = {}

  for (const key of Object.keys(results)) {
    const arr = results[key]
    if (arr) {
      stores[key] = new ScheduleItemStore(arr)
    }
  }

  return stores as { [T in keyof M]: ScheduleItemStore<M[T]> }
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
): (<T extends { readonly end?: Date | undefined }>(
  event: T,
) => event is T & { readonly end: Date }) => {
  return <T extends { readonly end?: Date | undefined }>(
    event: T,
  ): event is T & { readonly end: Date } =>
    !event.end || isBefore(now, event.end)
}

/**
 * Get a filter function for events beginning in the given {@link Interval}.
 */
export const makeDateFilter = (
  range: Interval,
): (<T extends { readonly start?: Date | undefined }>(
  event: T,
) => event is T & { readonly start: Date }) => {
  return <T extends { readonly start?: Date | undefined }>(
    e: T,
  ): e is T & { readonly start: Date } => {
    if (!e.start) {
      return false
    }
    return contains(range, e.start)
  }
}
