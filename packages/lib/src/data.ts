/**
 * Schedule data tools.
 * @module
 */

import { type ScheduleObjectBaseProps, type ScheduleDataTypeMap, type ScheduleEvent, type Vendor, type Amenity, type Profile, type Location, type ScheduleObject, type ScheduleObjectOccurrence } from "./types.js"
import { omitUndef } from "./utils.js"

type IndexTestFunc<D extends ScheduleObjectBaseProps, T extends D> = (obj: D) => obj is T

export type IndexConfig<D extends ScheduleObjectBaseProps, M extends ScheduleDataTypeMap<D>> = {
  readonly [K in keyof M]: IndexTestFunc<D, M[K]>
}

export type IndexResult<D extends ScheduleObjectBaseProps, M extends ScheduleDataTypeMap<D>> = {
  items: M[keyof M][]
  byId: Map<string, M[keyof M]>
  byType: {
    -readonly [K in keyof M]: {
      items: M[K][]
      byId: Map<string, M[K]>
    }
  }
  other: readonly D[]
}

/**
 * Index items by ID and type.
 */
export const indexData = <D extends ScheduleObjectBaseProps, M extends ScheduleDataTypeMap<D>>(
  config: IndexConfig<D, M>,
  items?: Iterable<D>,
): IndexResult<D, M> => {
  const result = {
    items: new Array<M[keyof M]>(),
    byId: new Map<string, M[keyof M]>(),
    byType: {} as {
      [K in keyof M]: {
        items: M[K][]
        byId: Map<string, M[K]>
      }
    },
    other: new Array<D>(),
  }

  let key: keyof M
  for (key of Object.keys(config)) {
    result.byType[key] = {
      items: [],
      byId: new Map(),
    }
  }

  const add = (item: D) => {
    let key: keyof M
    let matchedItem

    for (key of Object.keys(config)) {
      const entry = config[key]
      if (entry(item)) {
        const res = result.byType[key]
        res.items.push(item)
        res.byId.set(item.id, item)
        matchedItem = item
      }
    }

    if (matchedItem) {
      result.items.push(matchedItem)
      result.byId.set(matchedItem.id, matchedItem)
    } else {
      result.other.push(item)
    }
  }

  for (const item of items ?? []) {
    add(item)
  }

  return result
}

export const defaultIndexConfig = {
  events: (obj: ScheduleObject): obj is ScheduleEvent => obj.type == "event",
  vendors: (obj: ScheduleObject): obj is Vendor => obj.type == "vendor",
  amenities: (obj: ScheduleObject): obj is Amenity => obj.type == "amenity",
  profiles: (obj: ScheduleObject): obj is Profile => obj.type == "profile",
  locations: (obj: ScheduleObject): obj is Location => obj.type == "location",
} as const

/**
 * Transform a {@link ScheduleObject} into an array of {@link ScheduleObjectOccurrence}.
 */
export const toOccurrences = <T extends ScheduleObject = ScheduleObject>(obj: T): ScheduleObjectOccurrence<T>[] => {
  const occs: ScheduleObjectOccurrence<T>[] = []

  if (obj.occurrences && obj.occurrences.length > 0) {
    for (const occ of obj.occurrences) {
      occs.push(omitUndef({
        id: occ.id,
        object: obj,
        startDate: occ.startDate,
        endDate: occ.endDate,
        duration: occ.duration,
        locations: occ.locations,
      }))
    }
  } else {
    occs.push(omitUndef({
      id: obj.id,
      object: obj,
      startDate: obj.startDate,
      endDate: obj.endDate,
      duration: obj.duration,
      locations: obj.locations,
    }))
  }

  return occs
}