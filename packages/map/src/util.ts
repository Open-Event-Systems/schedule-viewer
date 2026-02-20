import { useMemo } from "react"
import type { MapLocation } from "./types.js"
import {
  contains,
  type DetailedScheduleItem,
  type ScheduleItemCollection,
} from "@open-event-systems/schedule-lib"
import { add, isAfter, isBefore } from "date-fns"
import type { MapViewerLocationItemInfo } from "./viewer/map-viewer.js"

export type MapLocationMatchFunc = (locName: string) => MapLocation | undefined

/**
 * Get a function to match a location name to a {@link MapLocation} object.
 */
export const makeMapLocationMatchFunc = (
  locations: Iterable<MapLocation>,
): MapLocationMatchFunc => {
  const byId = new Map<string, MapLocation>()
  const byAlias = new Map<string, MapLocation>()

  for (const loc of locations) {
    byId.set(loc.id, loc)

    if (loc.title) {
      byAlias.set(loc.title, loc)
    }

    for (const alias of loc.aliases ?? []) {
      if (alias) {
        byAlias.set(alias, loc)
      }
    }
  }

  return (locName) => {
    const loc = byId.get(locName)
    if (loc) {
      return loc
    }

    return byAlias.get(locName)
  }
}

/**
 * A hook that provides a function to map location names to {@link MapLocation} objects.
 */
export const useMapLocationMatchFunc = (
  locations: Iterable<MapLocation>,
): MapLocationMatchFunc => {
  const matchFunc = useMemo(() => {
    return makeMapLocationMatchFunc(locations)
  }, [locations])
  return matchFunc
}

/**
 * Get a map of location ids to currently occurring schedule items.
 */
export const getCurrentMapLocationItems = <
  T extends DetailedScheduleItem = DetailedScheduleItem,
>(
  items: ScheduleItemCollection<T>,
  matchFunc: MapLocationMatchFunc,
  now: Date,
): Map<string, T> => {
  const nowMap = new Map<string, T>()

  const currentItems = items.filter((it) => contains(it, now))

  for (const item of currentItems) {
    if (item.location) {
      const loc = matchFunc(item.location)

      if (loc && !nowMap.has(loc.id)) {
        nowMap.set(loc.id, item)
      }
    }
  }

  return nowMap
}

/**
 * Get a map of location ids to schedule items that will begin soon.
 */
export const getLaterMapLocationItems = <
  T extends DetailedScheduleItem = DetailedScheduleItem,
>(
  items: ScheduleItemCollection<T>,
  matchFunc: MapLocationMatchFunc,
  now: Date,
  maxLaterHours?: number,
): Map<string, T> => {
  const laterMap = new Map<string, T>()
  const maxLater = add(now, { hours: maxLaterHours || 1 })

  const laterItems = items.filter(
    (it) =>
      !!it.start && isAfter(it.start, now) && isBefore(it.start, maxLater),
  )

  for (const item of laterItems) {
    if (item.location) {
      const loc = matchFunc(item.location)

      if (loc && !laterMap.has(loc.id)) {
        laterMap.set(loc.id, item)
      }
    }
  }

  return laterMap
}

/**
 * Get location details for the map.
 */
export const getMapLocationInfo = (
  items: Iterable<DetailedScheduleItem>,
  matchFunc: MapLocationMatchFunc,
): readonly MapViewerLocationItemInfo[] => {
  const info: MapViewerLocationItemInfo[] = []

  for (const item of items) {
    if (item.location) {
      const loc = matchFunc(item.location)
      if (loc) {
        info.push({
          id: loc.id,
          icon: item.icon,
          title: item.title,
        })
      }
    }
  }

  return info
}
