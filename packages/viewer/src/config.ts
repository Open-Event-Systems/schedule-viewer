import {
  BookmarkAPI,
  makeBookmarkAPI,
  ScheduleConfig,
} from "@open-event-systems/schedule-lib"
import { QueryClient, UseSuspenseQueryOptions } from "@tanstack/react-query"
import wretch from "wretch"
import { loadBookmarks, syncBookmarks } from "./bookmarks.js"
import { DEFAULT_SCHEDULE_CONFIG } from "@open-event-systems/schedule-components/config/context"
import { MapConfig } from "@open-event-systems/schedule-map/types"

declare module "@open-event-systems/schedule-lib" {
  interface ScheduleConfig {
    homeURL?: string
    map?: MapConfig
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
} as const

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
