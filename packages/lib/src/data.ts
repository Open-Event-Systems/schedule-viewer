/**
 * Schedule data tools.
 * @module
 */

import {
  EVENT_TYPES,
  getJSONLDTypesFromHierarchy,
  ORGANIZATION_TYPES,
  type JSONLDTypesFromHierarchy,
} from "./ld.js"
import type {
  Address,
  Organization,
  Person,
  Place,
  ScheduleDataTypeMap,
  ScheduleEvent,
  ScheduleItem,
} from "./types.js"

export type GetEmbeddedItemsFunc = (
  item: ScheduleItem,
) => Iterable<ScheduleItem>

/**
 * Get embedded items from a {@link ScheduleItem}.
 */
export const getEmbeddedItems = function* (
  item: ScheduleItem,
): Generator<ScheduleItem, void, unknown> {
  if ("organizer" in item) {
    yield* yieldItems(item.organizer)
  }

  if ("performer" in item) {
    yield* yieldItems(item.performer)
  }

  if (
    "superEvent" in item &&
    item.superEvent &&
    typeof item.superEvent != "string"
  ) {
    yield item.superEvent
  }

  if ("subEvent" in item) {
    yield* yieldItems(item.subEvent)
  }

  if ("location" in item) {
    yield* yieldItems(item.location)
  }

  if ("address" in item && item.address && typeof item.address != "string") {
    yield item.address
  }
}

function yieldItems(gen?: null): Generator<never, void, unknown>
function yieldItems<T>(gen: Iterable<T | string>): Generator<T, void, unknown>
function* yieldItems<T>(
  gen: Iterable<T | string> | null | undefined,
): Generator<T, void, unknown> {
  if (!gen) {
    return
  }

  for (const item of gen) {
    if (typeof item != "string") {
      yield item
    }
  }
}

type IndexConfigEntry<T extends ScheduleItem> = {
  test: (obj: ScheduleItem) => obj is T
  getIds: (obj: T) => Iterable<string>
}

export type IndexConfig<M extends ScheduleDataTypeMap> = {
  readonly [K in keyof M]: IndexConfigEntry<M[K]>
}

export type IndexResult<M extends ScheduleDataTypeMap> = {
  items: ScheduleItem[]
  byId: Map<string, ScheduleItem>
  byType: {
    -readonly [K in keyof M]: {
      items: M[K][]
      byId: Map<string, M[K]>
    }
  }
  other: ScheduleItem[]
}

/**
 * Index items by ID and type.
 */
export const indexData = <M extends ScheduleDataTypeMap>(
  config: IndexConfig<M>,
  items?: Iterable<ScheduleItem>,
): IndexResult<M> => {
  const result = {
    items: new Array<ScheduleItem>(),
    byId: new Map(),
    byType: {},
    other: new Array<ScheduleItem>(),
  } as IndexResult<M>

  let key: keyof M
  for (key of Object.keys(config)) {
    result.byType[key] = {
      items: [],
      byId: new Map(),
    }
  }

  const add = (item: ScheduleItem) => {
    let key: keyof M
    let matched = false
    for (key of Object.keys(config)) {
      const entry = config[key]
      if (entry.test(item)) {
        const res = result.byType[key]
        res.items.push(item)
        for (const id of entry.getIds(item)) {
          result.byId.set(id, item)
          res.byId.set(id, item)
        }
        matched = true
      }
    }

    if (!matched) {
      result.other.push(item)
    } else {
      result.items.push(item)
    }
  }

  for (const item of items ?? []) {
    add(item)
  }

  return result
}

const eventTypeSet: ReadonlySet<JSONLDTypesFromHierarchy<typeof EVENT_TYPES>> =
  new Set(getJSONLDTypesFromHierarchy(EVENT_TYPES))
const orgTypeSet: ReadonlySet<
  JSONLDTypesFromHierarchy<typeof ORGANIZATION_TYPES>
> = new Set(getJSONLDTypesFromHierarchy(ORGANIZATION_TYPES))

export const isEvent = <T extends ScheduleItem>(
  obj: T,
): obj is T & ScheduleEvent =>
  eventTypeSet.has(obj.type as JSONLDTypesFromHierarchy<typeof EVENT_TYPES>)
export const isPerson = <T extends ScheduleItem>(obj: T): obj is T & Person =>
  obj.type == "Person"
export const isOrganization = <T extends ScheduleItem>(
  obj: T,
): obj is T & Organization =>
  orgTypeSet.has(
    obj.type as JSONLDTypesFromHierarchy<typeof ORGANIZATION_TYPES>,
  )
export const isPlace = <T extends ScheduleItem>(obj: T): obj is T & Place =>
  obj.type == "Place"
export const isAddress = <T extends ScheduleItem>(obj: T): obj is T & Address =>
  obj.type == "PostalAddress"

const getIds = function* (
  item: ScheduleItem,
): Generator<string, void, unknown> {
  if (item.id) {
    yield item.id
  }

  if (item.identifier) {
    yield item.identifier
  }

  if (item.sameAs) {
    yield* item.sameAs
  }
}

export const defaultIndexConfig = {
  events: {
    test: isEvent,
    getIds,
  },
  people: {
    test: isPerson,
    getIds,
  },
  organizations: {
    test: isOrganization,
    getIds,
  },
  places: {
    test: isPlace,
    getIds,
  },
  addresses: {
    test: isAddress,
    getIds,
  },
} as const
