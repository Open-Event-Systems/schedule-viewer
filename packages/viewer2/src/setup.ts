import { QueryClient } from "@tanstack/react-query"
import { loadConfig, type ViewerConfig } from "./config.js"
import type {
  ScheduleAPI,
  SelectionsAPI,
  SessionSelectionsStore,
} from "@open-event-systems/schedule-lib"
import {
  itemsQueryFns,
  itemsQueryKeys,
  makeScheduleAPIFromConfig,
  setupSelections,
} from "@open-event-systems/schedule-react"
import { parsers } from "./schedule.js"
import { SWStore } from "./service-worker.js"
import type { ScheduleJSConfig } from "./global-config.js"

export type SetupResult = {
  queryClient: QueryClient
  swStore: SWStore
  config: ViewerConfig
  scheduleAPI: ScheduleAPI
  sessionSelectionsStore: SessionSelectionsStore
  selectionsAPI: SelectionsAPI
}

export const setup = async (
  jsConfig?: ScheduleJSConfig,
): Promise<SetupResult> => {
  const configURL = `${jsConfig?.basePath}/config.json`
  const swStore = new SWStore()
  const queryClient = new QueryClient()

  if ("serviceWorker" in window.navigator) {
    if (jsConfig?.serviceWorker) {
      swStore.register(jsConfig.basePath, jsConfig.cacheURLs)
    } else {
      swStore.unregister()
    }
  }

  const config = await loadConfig(configURL)
  const scheduleAPI = makeScheduleAPIFromConfig(config)
  const [sessionSelectionsStore, selectionsAPI] = await setupSelections(config)

  return {
    queryClient,
    swStore,
    config,
    scheduleAPI,
    sessionSelectionsStore,
    selectionsAPI,
  }
}

export const cacheData = async (setupResult: SetupResult) => {
  const { config, queryClient, scheduleAPI } = setupResult
  return queryClient.fetchQuery({
    queryKey: itemsQueryKeys.items(config.id, parsers),
    queryFn: itemsQueryFns.items(scheduleAPI, parsers),
  })
}
