/**
 * Setup and loading for the SPA.
 */

import { QueryClient } from "@tanstack/react-query"
import type { AppContextValue } from "../types.js"
import type { SPAConfig } from "./config.js"
import { SWStore } from "../service-worker.js"
import { getDefaultStore } from "jotai"
import { loadConfig } from "../config.js"
import {
  makeScheduleAPIFromConfig,
  setupSelections,
} from "@open-event-systems/schedule-react"

export const setup = async (spaConfig: SPAConfig): Promise<AppContextValue> => {
  const config = await loadConfig(`${spaConfig.basePath}/config.json`)
  const scheduleAPI = makeScheduleAPIFromConfig(config)
  const [sessionSelectionsStore, selectionsAPI] = await setupSelections(config)

  const swStore = new SWStore(getDefaultStore())

  if ("serviceWorker" in window.navigator) {
    if (spaConfig.serviceWorker) {
      swStore.register(spaConfig.basePath, spaConfig.cacheURLs)
    } else {
      swStore.unregister()
    }
  }

  return {
    historyType: spaConfig.router,
    origin: window.origin,
    getCurrentURL: () => window.location.href,
    queryClient: new QueryClient(),
    swStore,
    config,
    scheduleAPI,
    sessionSelectionsStore,
    selectionsAPI,
  }
}
