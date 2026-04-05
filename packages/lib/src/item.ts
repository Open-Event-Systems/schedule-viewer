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
  ScheduleItemDetails,
} from "./types.js"
import { opt, optStr, strDate, strSetSchema } from "./schema.js"
import z from "zod"

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
    return {
      success: false,
      error: res.error,
      message: z.prettifyError(res.error),
    }
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
    return {
      success: false,
      error: res.error,
      message: z.prettifyError(res.error),
    }
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
    return {
      success: false,
      error: res.error,
      message: z.prettifyError(res.error),
    }
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
    return {
      success: false,
      error: res.error,
      message: z.prettifyError(res.error),
    }
  }
}

/**
 * Maps item `type` values to specific item types.
 */
export type ItemTypeMap = {
  readonly [type: string]: ScheduleItem
}

/**
 * Maps item `type` values to parsers for that item type.
 */
export type ItemParserMap<M extends ItemTypeMap> = {
  readonly [T in keyof M]: Parser<M[T], ScheduleItem>
}

/**
 * The result of parsing a schedule item with a given type map.
 */
export type ParseItemResult<M extends ItemTypeMap> = ParseResult<M[keyof M]>

export type ParseItemsResult<M extends ItemTypeMap> = Readonly<{
  byType: {
    readonly [T in keyof M]: readonly M[T][]
  }
  errors: readonly ParseResult<ScheduleItem>[]
}>

/**
 * Parse a {@link ScheduleItem} using the provided parsers.
 */
export const parseItemType = <M extends ItemTypeMap>(
  typeParsers: ItemParserMap<M>,
  item: ScheduleItem,
): ParseResult<M[keyof M]> => {
  const parser = typeParsers[item.type]
  if (!parser) {
    return { success: false, message: `Unknown item type: ${item.type}` }
  }

  return parser(item)
}

/**
 * Parse an iterable of {@link ScheduleItem} using the provided parsers.
 */
export const parseItems = <M extends ItemTypeMap>(
  typeParsers: ItemParserMap<M>,
  items: Iterable<ScheduleItem>,
): ParseItemsResult<M> => {
  const results: Record<string, M[keyof M][]> = {}
  const other: ParseResult<ScheduleItem>[] = []

  for (const key of Object.keys(typeParsers)) {
    results[key] = []
  }

  for (const itemInput of items) {
    const res = parseItemType(typeParsers, itemInput)
    const arr = results[itemInput.type]
    if (arr && res.success) {
      arr.push(res.value)
    } else {
      other.push(res)
    }
  }

  const asReadonly = results as Record<keyof M, Readonly<M[keyof M][]>>

  return {
    byType: asReadonly as { readonly [T in keyof M]: readonly M[T][] },
    errors: other,
  }
}

/**
 * Return a filter for items matching the given search string.
 */
export const makeTitleFilter = (
  title: string,
): (<T extends Pick<ScheduleItemDetails, "title">>(
  item: T,
) => item is T & Required<Pick<ScheduleItemDetails, "title">>) => {
  const lowerTitle = title.trim().toLowerCase()
  return <T extends Pick<ScheduleItemDetails, "title">>(
    item: T,
  ): item is T & Required<Pick<ScheduleItemDetails, "title">> =>
    !!item.title && item.title.toLowerCase().includes(lowerTitle)
}

/**
 * Return a filter for items not containing disabled tags.
 */
export const makeTagFilter = (
  excludedTags: Iterable<string>,
): (<T extends Pick<ScheduleItemDetails, "tags">>(
  item: T,
) => item is T & Required<Pick<ScheduleItemDetails, "tags">>) => {
  const excludedTagsArr = [...excludedTags]
  return <T extends Pick<ScheduleItemDetails, "tags">>(
    item: T,
  ): item is T & Required<Pick<ScheduleItemDetails, "tags">> =>
    !excludedTagsArr.some((t) => item.tags && item.tags.has(t))
}

/**
 * Return a filter for items that have not passed.
 */
export const makePastItemFilter = (
  now: Date,
): ((item: Pick<ScheduleItem, "end">) => boolean) => {
  return (item) => !item.end || isBefore(now, item.end)
}

/**
 * Get a filter function for items beginning in the given {@link Interval}.
 */
export const makeDateFilter = (
  range: Interval,
): (<T extends Pick<ScheduleItem, "start">>(
  item: T,
) => item is T & Required<Pick<ScheduleItem, "start">>) => {
  return <T extends Pick<ScheduleItem, "start">>(
    item: T,
  ): item is T & Required<Pick<ScheduleItem, "start">> => {
    if (!item.start) {
      return false
    }
    return contains(range, item.start)
  }
}

/**
 * Return a generator from an iterable of items where each item ID only appears once.
 */
export function* iterUniqueIds<T extends { readonly id?: string }>(
  items?: Iterable<T>,
): Generator<T, void, void> {
  const seenSet = new Set<string>()
  for (const item of items ?? []) {
    if (item.id != null && seenSet.has(item.id)) {
      continue
    }

    if (item.id != null) {
      seenSet.add(item.id)
    }
    yield item
  }
}
