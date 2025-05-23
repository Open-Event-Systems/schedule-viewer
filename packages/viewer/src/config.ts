import {
  BookmarkAPI,
  makeBookmarkAPI,
  ScheduleConfig,
} from "@open-event-systems/schedule-lib"
import { QueryClient, UseSuspenseQueryOptions } from "@tanstack/react-query"
import wretch from "wretch"
import { loadBookmarks, syncBookmarks } from "./bookmarks.js"
import {
  DEFAULT_SCHEDULE_CONFIG,
  useScheduleConfig,
} from "@open-event-systems/schedule-components/config/context"
import { MapConfig } from "@open-event-systems/schedule-map/types"
import { useMemo } from "react"
import { useLocation } from "@tanstack/react-router"
import { parseISO } from "date-fns"

declare module "@open-event-systems/schedule-lib" {
  interface ScheduleConfig {
    homeURL?: string
    map?: Partial<MapConfig>
  }
}

export type AppConfig = Readonly<{
  config: ScheduleConfig
  bookmarkAPI?: BookmarkAPI
  sessionId?: string
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

export const getMapConfig = (config: ScheduleConfig): MapConfig => ({
  ...DEFAULT_MAP_CONFIG,
  ...config.map,
})

export const useMapConfig = (): MapConfig => {
  const config = useScheduleConfig()
  return useMemo(() => getMapConfig(config), [config])
}

export const getConfigQueryOptions = (
  configURL: string,
): UseSuspenseQueryOptions<Partial<ScheduleConfig>> => {
  return {
    queryKey: ["schedule-config"],
    async queryFn() {
      const res = await wretch(configURL).get().json<Partial<ScheduleConfig>>()
      return res
    },
    staleTime: Infinity,
  }
}

export const makeAppConfig = async (
  queryClient: QueryClient,
  configURL: string,
): Promise<AppConfig> => {
  const loadedConfig = await queryClient.fetchQuery(
    getConfigQueryOptions(configURL),
  )
  const config: ScheduleConfig = {
    ...DEFAULT_SCHEDULE_CONFIG,
    ...loadedConfig,
  }
  let bookmarkAPI = config.bookmarks
    ? makeBookmarkAPI(config.bookmarks)
    : undefined

  let sessionId: string | undefined

  if (bookmarkAPI) {
    try {
      const res = await bookmarkAPI.setup()
      sessionId = res.sessionId
    } catch (_e) {
      bookmarkAPI = undefined
    }
  }

  // load bookmarks
  const [local, remote] = await loadBookmarks(
    queryClient,
    config.id,
    bookmarkAPI,
  )
  // sync bookmarks
  if (bookmarkAPI) {
    await syncBookmarks(queryClient, config.id, bookmarkAPI, local, remote)
  }

  return { config, bookmarkAPI, sessionId }
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
