/**
 * Setup and loading for the SPA.
 */

import { QueryClient } from "@tanstack/react-query"
import type { AppContextValue } from "../types.js"
import type { SPAConfig } from "./config.js"
import { loadConfig } from "../config.js"
import {
  makeScheduleAPIFromConfig,
  sessionSelectionsQueryOptions,
} from "@open-event-systems/schedule-react"
import {
  makeLocalStorageSessionSelectionsStore,
  makeSelectionsServiceAPI,
  makeSyncedSelectionsAPI,
} from "@open-event-systems/schedule-lib"

import { makeSWStore } from "../sw/service-worker.js"
import type { StoreApi } from "zustand"
import type { PWAState } from "../sw/pwa.js"

export const swStore = makeSWStore()

export const setup = async (
  spaConfig: SPAConfig,
  pwaStore: StoreApi<PWAState>,
): Promise<AppContextValue> => {
  const queryClient = new QueryClient()

  const config = await loadConfig(`${spaConfig.basePath}/config.json`)
  const scheduleAPI = makeScheduleAPIFromConfig(config)

  const selectionsServiceAPI = config.selectionsService
    ? makeSelectionsServiceAPI(config.selectionsService, config.id)
    : undefined

  if (selectionsServiceAPI) {
    window.addEventListener("storage", selectionsServiceAPI.handleStorageEvent)
  }

  const localSessionSelectionsStores = {
    bookmarks: makeLocalStorageSessionSelectionsStore("bookmarks", config.id),
  }

  window.addEventListener("storage", (e) => {
    localSessionSelectionsStores.bookmarks.handleStorageEvent(e)
    queryClient.setQueryData(
      sessionSelectionsQueryOptions.sessionSelections(
        sessionSelectionsAPIs.bookmarks,
        config.id,
        "bookmarks",
      ).queryKey,
      localSessionSelectionsStores.bookmarks.get(),
    )
  })

  const sessionSelectionsAPIs = {
    bookmarks: makeSyncedSelectionsAPI(
      "bookmarks",
      localSessionSelectionsStores.bookmarks,
      selectionsServiceAPI,
    ),
  }

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
    queryClient,
    pwaStore,
    swStore,
    config,
    scheduleAPI,
    localSessionSelectionsStores,
    selectionsServiceAPI,
    sessionSelectionsAPIs,
  }
}
