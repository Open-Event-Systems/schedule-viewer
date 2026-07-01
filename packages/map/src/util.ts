import { useMemo } from "react"
import type { MapLocation } from "./types.js"
import {
  contains,
  isPlace,
  iterToArr,
  type Address,
  type Place,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import type { MapViewerLocationItemInfo } from "./viewer/map-viewer.js"
import type { Dayjs } from "dayjs"

/**
 * Maps an event location value to a {@link Place}.
 */
export type MapLocationMatchFunc = (
  location: string | Place | Address,
) => Place | null | undefined

/**
 * Get a function to match a location name to a {@link MapLocation} object.
 */
export const makeMapLocationMatchFunc = (
  places?: Iterable<Place> | null,
  placesById?: ReadonlyMap<string, Place> | null,
): MapLocationMatchFunc => {
  const placesByAlias = new Map<string, Place>()
  placesById = placesById ?? new Map()

  for (const place of places ?? []) {
    if (place.name) {
      placesByAlias.set(place.name, place)
    }

    for (const alias of place.aliases ?? []) {
      placesByAlias.set(alias, place)
    }
  }

  return (loc) => {
    if (typeof loc == "string") {
      const byId = placesById.get(loc)
      if (byId) {
        return byId
      }
      const byAlias = placesByAlias.get(loc)
      if (byAlias) {
        return byAlias
      }
    } else if (isPlace(loc)) {
      return loc
    } else {
      // TODO: match by address
    }
  }
}

/**
 * A hook that provides a function to map location names to {@link MapLocation} objects.
 */
export const useMapLocationMatchFunc = (
  places?: Iterable<Place> | null,
  placesById?: ReadonlyMap<string, Place> | null,
): MapLocationMatchFunc => {
  const matchFunc = useMemo(() => {
    return makeMapLocationMatchFunc(places, placesById)
  }, [places, placesById])
  return matchFunc
}

/**
 * Get a map of location ids to currently occurring schedule items.
 */
export const getCurrentMapLocationItems = (
  items: Iterable<ScheduleItem> | null | undefined,
  matchFunc: MapLocationMatchFunc,
  now: Dayjs,
): Map<string, ScheduleItem> => {
  const nowMap = new Map<string, ScheduleItem>()

  const currentItems = iterToArr(items).filter(
    (it) => !("startDate" in it && "endDate" in it) || contains(it, now),
  )

  for (const item of currentItems) {
    const itemLocs = "location" in item ? (item.location ?? []) : []
    for (const locEntry of itemLocs) {
      const loc = matchFunc(locEntry)

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
export const getLaterMapLocationItems = (
  items: Iterable<ScheduleItem> | null | undefined,
  matchFunc: MapLocationMatchFunc,
  now: Dayjs,
  maxLaterHours = 2,
): Map<string, ScheduleItem> => {
  const laterMap = new Map<string, ScheduleItem>()
  const maxLater = now.add(maxLaterHours, "hour")

  const laterItems = iterToArr(items).filter(
    (it) =>
      "startDate" in it &&
      !!it.startDate &&
      it.startDate.isAfter(now) &&
      it.startDate.isBefore(maxLater),
  )

  for (const item of laterItems) {
    const itemLocs = "location" in item ? (item.location ?? []) : []
    for (const locEntry of itemLocs) {
      const loc = matchFunc(locEntry)

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
  items: Iterable<ScheduleItem> | null | undefined,
  matchFunc: MapLocationMatchFunc,
): readonly MapViewerLocationItemInfo[] => {
  const info: MapViewerLocationItemInfo[] = []

  for (const item of items ?? []) {
    const itemLocs = "location" in item ? (item.location ?? []) : []
    for (const locEntry of itemLocs) {
      const loc = matchFunc(locEntry)
      if (loc) {
        info.push({
          id: loc.id,
          icon: getIcon(item),
          name: item.name,
        })
      }
    }
  }

  return info
}

const getIcon = (item: ScheduleItem) => {
  const image = "image" in item ? (item.image ?? []) : []

  // TODO: better logic
  for (const entry of image ?? []) {
    if (typeof entry == "string") {
      return entry
    } else {
      return entry.contentUrl
    }
  }
}
