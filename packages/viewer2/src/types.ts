import type { QueryClient } from "@tanstack/react-query"
import type { SWStore } from "./service-worker.js"
import type { ViewerConfig } from "./config.js"
import type {
  ScheduleAPI,
  SelectionsAPI,
  SessionSelectionsStore,
} from "@open-event-systems/schedule-lib"
import type { MantineThemeOverride } from "@mantine/core"

export type ScheduleJSConfig = Readonly<{
  [key: string]: unknown
  theme?: MantineThemeOverride
  colorScheme: "light" | "dark"
  basePath: string
  serviceWorker: boolean
  cacheURLs: readonly string[]
  router: "hash" | "browser"
}>

export type AppContextValue = Readonly<{
  jsConfig: ScheduleJSConfig
  queryClient: QueryClient
  swStore: SWStore
  config: ViewerConfig
  scheduleAPI: ScheduleAPI
  sessionSelectionsStore: SessionSelectionsStore
  selectionsAPI: SelectionsAPI
  getCurrentURL: () => string
}>

declare global {
  var scheduleConfig: Partial<ScheduleJSConfig> | undefined
  var __VIEWER_VERSION__: string
}
