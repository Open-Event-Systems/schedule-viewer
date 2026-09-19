import { setupCache } from "#src/sw/cache.js"
import { clientsClaim } from "workbox-core"

declare let self: ServiceWorkerGlobalScope

// take control of page immediately
clientsClaim()

setupCache(self.__WB_MANIFEST)

// skipWaiting handler
self.addEventListener("message", (e) => {
  if (e.data && e.data.type == "SKIP_WAITING") {
    self.skipWaiting()
  }
})
