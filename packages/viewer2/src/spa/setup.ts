/**
 * Setup and loading for the SPA.
 */

import { QueryClient } from "@tanstack/react-query"
import type { AppContextValue } from "../types.js"
import type { SPAConfig } from "./config.js"
import { loadConfig } from "../config.js"
import {
  makeScheduleAPIFromConfig,
  setupSelections,
} from "@open-event-systems/schedule-react"
import { makeSWStore } from "../sw/service-worker.js"

export const setup = async (spaConfig: SPAConfig): Promise<AppContextValue> => {
  const config = await loadConfig(`${spaConfig.basePath}/config.json`)
  const scheduleAPI = makeScheduleAPIFromConfig(config)
  const [sessionSelectionsStore, selectionsAPI] = await setupSelections(config)

  const swStore = makeSWStore()

  if ("serviceWorker" in window.navigator) {
    if (spaConfig.serviceWorker) {
      swStore.getState().register(spaConfig.basePath, spaConfig.cacheURLs)
    } else {
      swStore.getState().unregister()
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
