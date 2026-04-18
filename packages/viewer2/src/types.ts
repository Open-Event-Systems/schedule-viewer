import type { QueryClient } from "@tanstack/react-query"
import type { SWState } from "./sw/service-worker.js"
import type {
  LocalSessionSelectionsStore,
  ScheduleAPI,
  SelectionsServiceAPI,
  SessionSelectionsAPI,
} from "@open-event-systems/schedule-lib"
import type { StoreApi } from "zustand"
import type { PWAState } from "./sw/pwa.js"
import type {
  ScheduleConfig,
  SchedulePageFeature,
} from "@open-event-systems/schedule-react"
import type { MapConfig } from "@open-event-systems/schedule-map"

export type ViewConfig = Readonly<{
  id: string
  type: ScheduleViewComponentType
  title: string
  enableFeatures?: readonly SchedulePageFeature[]
  showPastEvents?: boolean
  onlyBookmarked?: boolean
  onlyUnvisited?: boolean
}>

export type PageConfig = Readonly<{
  id: string
  title?: string
  description?: string
  views: readonly ViewConfig[]
  onlyType?: readonly string[]
  requireTags?: readonly string[]
  excludeTags?: readonly string[]
}>

export type Address = Readonly<{
  address?: string
  address2?: string
  city?: string
  state?: string
  postal?: string
  country?: string
}>

export type LocationAddressEntry = Readonly<{
  location: readonly string[]
  address: Address
}>

/**
 * Viewer config object.
 */
export type ViewerConfig = ScheduleConfig &
  Readonly<{
    homeURL?: string
    logoURL?: string
    pages: readonly PageConfig[]
    locationAddresses: readonly LocationAddressEntry[]
    map?: MapConfig
  }>

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
  localSessionSelectionsStores: {
    bookmarks: LocalSessionSelectionsStore
  }
  selectionsServiceAPI?: SelectionsServiceAPI
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
