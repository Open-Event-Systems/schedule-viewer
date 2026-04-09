/**
 * Setup and loading for the SPA.
 */

import { QueryClient } from "@tanstack/react-query"
import type { AppContextValue } from "../types.js"
import type { SPAConfig } from "./config.js"
import { loadConfig } from "../config.js"
import { makeScheduleAPIFromConfig } from "@open-event-systems/schedule-react"
import {
  makeLocalStorageSessionSelectionsStore,
  makeServerAPI,
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
  const config = await loadConfig(`${spaConfig.basePath}/config.json`)
  const scheduleAPI = makeScheduleAPIFromConfig(config)

  const [serverAPI, serverSessionSelectionsAPIFactory] = config.bookmarks
    ? makeServerAPI(config.bookmarks, config.id)
    : [undefined, undefined]

  const serverSessionSelectionsAPIs = serverSessionSelectionsAPIFactory
    ? {
        bookmarks: serverSessionSelectionsAPIFactory("bookmarks"),
      }
    : {}

  const localSessionSelectionsStores = {
    bookmarks: makeLocalStorageSessionSelectionsStore("bookmarks", config.id),
  }

  const sessionSelectionsAPIs = {
    bookmarks: makeSyncedSelectionsAPI(
      localSessionSelectionsStores.bookmarks,
      serverSessionSelectionsAPIs?.bookmarks,
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
    queryClient: new QueryClient(),
    pwaStore,
    swStore,
    config,
    scheduleAPI,
    sessionSelectionsAPIs,
    localSessionSelectionsStores,
    serverSessionSelectionsAPIs,
    serverSelectionsAPI: serverAPI,
  }
}
