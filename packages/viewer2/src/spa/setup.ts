import { QueryClient } from "@tanstack/react-query"
import type { AppContextValue, ScheduleJSConfig } from "../types.js"
import { SWStore } from "../service-worker.js"
import { getDefaultStore } from "jotai"
import { loadConfig } from "../config.js"
import {
  makeScheduleAPIFromConfig,
  setupSelections,
} from "@open-event-systems/schedule-react"
import {
  createBrowserHistory,
  createHashHistory,
  type Register,
} from "@tanstack/react-router"
import { makeRouter } from "../router.js"

export const setup = async (
  jsConfig: ScheduleJSConfig,
): Promise<{
  context: AppContextValue
  router: Register["router"]
}> => {
  const queryClient = new QueryClient()
  const swStore = new SWStore(getDefaultStore())
  const getCurrentURL = () => window.location.href

  if ("serviceWorker" in window.navigator) {
    if (jsConfig.serviceWorker) {
      swStore.register(jsConfig.basePath, jsConfig.cacheURLs)
    } else {
      swStore.unregister()
    }
  }

  const config = await loadConfig(`${jsConfig.basePath}/config.json`)
  const scheduleAPI = makeScheduleAPIFromConfig(config)
  const [sessionSelectionsStore, selectionsAPI] = await setupSelections(config)

  const ctx = {
    jsConfig,
    queryClient,
    swStore,
    config,
    scheduleAPI,
    sessionSelectionsStore,
    selectionsAPI,
    getCurrentURL,
  }

  let history

  if (jsConfig.router == "browser") {
    history = createBrowserHistory()
  } else {
    history = createHashHistory()
  }

  const router = makeRouter(ctx, window.origin, history)
  await router.load()

  return { router, context: ctx }
}
