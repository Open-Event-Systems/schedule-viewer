import { MapConfig, MapLocation } from "./types.js"

export const getMapLocations = (
  config: MapConfig,
): Map<string, MapLocation> => {
  const locs = new Map<string, MapLocation>()
  config.locations.forEach((loc) => {
    locs.set(loc.id, loc)
  })
  return locs
}
