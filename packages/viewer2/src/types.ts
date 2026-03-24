import type { QueryClient } from "@tanstack/react-query"
import type { SWStore } from "./service-worker.js"
import type { ViewerConfig } from "./config.js"
import type {
  ScheduleAPI,
  SelectionsAPI,
  SessionSelectionsStore,
} from "@open-event-systems/schedule-lib"

/**
 * Parts of app context that are known at page load.
 */
export type StaticAppContextValue = Readonly<{
  historyType: "browser" | "hash"
  origin: string
  getCurrentURL: () => string
  queryClient: QueryClient
  swStore: SWStore
}>

/**
 * Parts of app context that depend on dynamic configuration.
 */
export type DynamicAppContextValue = Readonly<{
  config: ViewerConfig
  scheduleAPI: ScheduleAPI
  sessionSelectionsStore: SessionSelectionsStore
  selectionsAPI: SelectionsAPI
}>

export type AppContextValue = StaticAppContextValue & DynamicAppContextValue

declare global {
  var __VIEWER_VERSION__: string
}
