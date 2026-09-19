import { setCacheNameDetails } from "workbox-core"
import {
  cleanupOutdatedCaches,
  precacheAndRoute,
  type PrecacheEntry,
} from "workbox-precaching"

// declare let self: ServiceWorkerGlobalScope

export const setupCache = (precacheArr: (PrecacheEntry | string)[]) => {
  setCacheNameDetails({
    prefix: "ule",
  })

  precacheAndRoute(precacheArr)
  cleanupOutdatedCaches()
}
