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

type IndexConfigEntry<T extends ScheduleItem> = {
  test: (obj: ScheduleItem) => obj is T
  getIds: (obj: T) => Iterable<string>
  getEmbedded?: (obj: T) => Iterable<ScheduleItem>
}

type IndexConfig<M extends ScheduleDataTypeMap> = {
  readonly [K in keyof M]: IndexConfigEntry<M[K]>
}

type IndexResult<M extends ScheduleDataTypeMap> = {
  byId: Map<string, ScheduleItem>
  byType: { -readonly [K in keyof M]: Map<string, M[K]> }
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
    byId: new Map(),
    byType: {},
    other: new Array<ScheduleItem>(),
  } as IndexResult<M>

  let key: keyof M
  for (key of Object.keys(config)) {
    result.byType[key] = new Map()
  }

  const addToMap = <T extends M[keyof M]>(
    map: Map<string, T>,
    entry: IndexConfigEntry<T>,
    item: T,
  ) => {
    for (const id of entry.getIds(item)) {
      result.byId.set(id, item)
      map.set(id, item)
    }

    if (entry.getEmbedded) {
      for (const embeddedItem of entry.getEmbedded(item)) {
        add(embeddedItem)
      }
    }
  }

  const add = (item: ScheduleItem) => {
    let key: keyof M
    let matched = false
    for (key of Object.keys(config)) {
      const entry = config[key]
      if (entry.test(item)) {
        const map = result.byType[key]
        addToMap(map, entry, item)
        matched = true
      }
    }

    if (!matched) {
      result.other.push(item)
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
    getEmbedded: function* (item: ScheduleEvent) {
      if (item.organizer) {
        for (const p of item.organizer) {
          if (typeof p == "object") {
            yield p
          }
        }
      }

      if (item.performer) {
        for (const p of item.performer) {
          if (typeof p == "object") {
            yield p
          }
        }
      }

      if (item.location) {
        for (const loc of item.location) {
          if (typeof loc == "object") {
            yield loc
          }
        }
      }

      if (typeof item.superEvent == "object") {
        yield item.superEvent
      }

      if (item.subEvent) {
        for (const subEvent of item.subEvent) {
          if (typeof subEvent == "object") {
            yield subEvent
          }
        }
      }
    },
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
    getEmbedded: function* (item: Place) {
      if (typeof item.address == "object") {
        yield item.address
      }

      if (item.event) {
        for (const event of item.event) {
          if (typeof event == "object") {
            yield event
          }
        }
      }
    },
  },
  addresses: {
    test: isAddress,
    getIds,
  },
} as const
