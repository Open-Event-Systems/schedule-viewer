import { add, isBefore, parseISO } from "date-fns"
import { MapConfig, MapEvent, MapLocation } from "./types.js"

export const getMapLocations = (
  config: MapConfig,
): Map<string, MapLocation> => {
  const locs = new Map<string, MapLocation>()
  config.locations.forEach((loc) => {
    locs.set(loc.id, loc)
  })
  return locs
}

export const getMapFlags = (config: MapConfig, now?: Date): Set<string> => {
  const flags = new Set<string>()

  for (const entry of config.flags) {
    if (typeof entry == "string") {
      flags.add(entry)
    } else {
      now = now || new Date()
      const startDate = entry.start ? parseISO(entry.start) : null
      const endDate = entry.end ? parseISO(entry.end) : null
      if (
        (!startDate || !isBefore(now, startDate)) &&
        (!endDate || isBefore(now, endDate))
      ) {
        flags.add(entry.flag)
      }
    }
  }

  return flags
}

export const getMapEventsByLocation = (
  location: Iterable<MapLocation>,
  events: Iterable<MapEvent>,
): Map<string, readonly MapEvent[]> => {
  const map = new Map<string, MapEvent[]>()
  for (const loc of location) {
    const res = []
    for (const ev of events) {
      if (
        !!ev.location &&
        (ev.location == loc.id || (loc.aliases ?? []).includes(ev.location))
      ) {
        res.push(ev)
      }
    }
    map.set(loc.id, res)
  }
  return map
}

export const getMapLocationsWithAlias = (
  config: MapConfig,
): Map<string, MapLocation> => {
  const map = new Map<string, MapLocation>()

  for (const loc of config.locations) {
    if (loc.title) {
      map.set(loc.title, loc)
    }
    for (const alias of loc.aliases ?? []) {
      map.set(alias, loc)
    }
  }

  for (const loc of config.locations) {
    map.set(loc.id, loc)
  }

  return map
}

export const makeCurrentEventFilter = (
  now?: Date,
): (<T extends MapEvent>(
  mapEvent: T,
) => mapEvent is T & { start: Date; end: Date }) => {
  now = now || new Date()
  return <T extends MapEvent>(t: T): t is T & { start: Date; end: Date } => {
    return (
      !!t.start && !!t.end && !isBefore(now, t.start) && isBefore(now, t.end)
    )
  }
}

export const makeFutureEventFilter = (
  minutes: number,
  now?: Date,
): (<T extends MapEvent>(
  mapEvent: T,
) => mapEvent is T & { start: Date; end: Date }) => {
  now = now || new Date()
  const cutoff = add(now, { minutes })
  return <T extends MapEvent>(t: T): t is T & { start: Date; end: Date } => {
    return (
      !!t.start &&
      !!t.end &&
      isBefore(now, t.start) &&
      isBefore(t.start, cutoff)
    )
  }
}
