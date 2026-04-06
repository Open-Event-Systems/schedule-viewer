import type { QueryClient } from "@tanstack/react-query"
import type { SWState } from "./sw/service-worker.js"
import type { ViewerConfig } from "./config.js"
import type {
  LocalSessionSelectionsStore,
  ScheduleAPI,
  ServerSelectionsAPI,
  SessionSelectionsAPI,
} from "@open-event-systems/schedule-lib"
import type { StoreApi } from "zustand"
import type { PWAState } from "./sw/pwa.js"

/**
 * Parts of app context that are known at page load.
 */
export type StaticAppContextValue = Readonly<{
  historyType: "browser" | "hash"
  origin: string
  getCurrentURL: () => string
  queryClient: QueryClient
  pwaStore: StoreApi<PWAState>
  swStore: StoreApi<SWState>
}>

/**
 * Parts of app context that depend on dynamic configuration.
 */
export type DynamicAppContextValue = Readonly<{
  config: ViewerConfig
  scheduleAPI: ScheduleAPI
  serverSelectionsAPI?: ServerSelectionsAPI
  localSessionSelectionsStores: {
    bookmarks: LocalSessionSelectionsStore
  }
  sessionSelectionsAPIs: Readonly<{
    bookmarks: SessionSelectionsAPI
  }>
}>

export type AppContextValue = StaticAppContextValue & DynamicAppContextValue

export const scheduleViewComponentTypes = [
  "daily-agenda",
  "full-agenda",
  "daily-catalog",
  "catalog",
  "tags",
] as const
export type ScheduleViewComponentType =
  (typeof scheduleViewComponentTypes)[number]

declare global {
  var __VIEWER_VERSION__: string
}
