import {
  BookmarkAPI,
  BookmarkServiceAPI,
  EventAPI,
  makeEventAPI,
} from "@open-event-systems/schedule-lib"
import { QueryClient, UseSuspenseQueryOptions } from "@tanstack/react-query"
import wretch from "wretch"
import { MapConfig } from "@open-event-systems/schedule-map/types"
import { createContext, useContext } from "react"
import { useLocation } from "@tanstack/react-router"
import { parseISO } from "date-fns"

import {
  DEFAULT_SCHEDULE_CONFIG,
  makeConfig,
  ScheduleConfig,
  ScheduleConfigJSON,
} from "@open-event-systems/schedule-react"
import { setupBookmarks } from "@open-event-systems/schedule-react"

declare module "@open-event-systems/schedule-react" {
  interface ScheduleConfigJSON {
    homeURL?: string
    map?: Partial<MapConfig>
  }
}

export type ViewerConfig = ScheduleConfig &
  Readonly<{
    homeURL?: string
    map?: MapConfig
  }>

export const ViewerConfigContext = createContext<ViewerConfig>({
  homeURL: "/",
  ...DEFAULT_SCHEDULE_CONFIG,
})
export const ViewerConfigProvider = ViewerConfigContext.Provider
export const useViewerConfig = (): ViewerConfig =>
  useContext(ViewerConfigContext)

export type AppConfig = Readonly<{
  config: ViewerConfig
  eventAPI: EventAPI
  bookmarkAPI: BookmarkAPI
  bookmarkServiceAPI: BookmarkServiceAPI | null
  sessionId: string | null
}>

export const DEFAULT_MAP_CONFIG = {
  src: "/map.svg",
  defaultLevel: "",
  flags: [],
  layers: [],
  levels: [],
  locations: [],
  vendors: [],
  minScale: 0.1,
  maxScale: 10,
} as const

export const getMapConfig = (config: ViewerConfig): MapConfig => ({
  ...DEFAULT_MAP_CONFIG,
  ...config.map,
})

export const useMapConfig = (): MapConfig => {
  const config = useViewerConfig()
  return config.map ?? DEFAULT_MAP_CONFIG
}

export const getConfigQueryOptions = (
  configURL: string,
): UseSuspenseQueryOptions<ViewerConfig> => {
  return {
    queryKey: ["schedule-config"],
    async queryFn() {
      const res = await wretch(configURL).get().json<ScheduleConfigJSON>()

      const config = makeConfig(res)
      const viewerConfig: {
        -readonly [K in keyof ViewerConfig]: ViewerConfig[K]
      } = {
        homeURL: "/",
        ...config,
      }

      if (res.map) {
        const mapConfig = { ...DEFAULT_MAP_CONFIG, ...res.map }
        viewerConfig.map = mapConfig
      }

      return viewerConfig
    },
    staleTime: Infinity,
  }
}

export const makeAppConfig = async (
  queryClient: QueryClient,
  configURL: string,
): Promise<AppConfig> => {
  const config = await queryClient.fetchQuery(getConfigQueryOptions(configURL))

  // constructing eventapi with an empty string is hacky...
  const eventAPI = makeEventAPI(
    typeof config.events == "string" ? config.events : "",
    config.timeZone,
  )
  const [bookmarkAPI, bookmarkServiceAPI] = await setupBookmarks(config)

  const sessionId = bookmarkServiceAPI?.sessionId ?? null

  return { config, eventAPI, bookmarkAPI, bookmarkServiceAPI, sessionId }
}

/**
 * Get the current time.
 *
 * Overridable via `time` hash param.
 */
export const useTime = (): Date => {
  const loc = useLocation()
  const hashParams = new URLSearchParams(loc.hash)
  const tStr = hashParams.get("time")
  if (tStr) {
    const now = parseISO(tStr)
    if (!isNaN(now.getTime())) {
      return now
    }
  }

  return new Date()
}
