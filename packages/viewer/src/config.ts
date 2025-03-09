import wretch from "wretch"
import {
  BookmarkAPI,
  makeBookmarkAPI,
  RequiredScheduleConfig,
} from "@open-event-systems/schedule-lib"
import { QueryClient, UseSuspenseQueryOptions } from "@tanstack/react-query"
import { listenForStorageUpdates } from "./local-storage.js"
import { getStoredBookmarksMutationOptions } from "./bookmarks.js"

declare module "@open-event-systems/schedule-lib" {
  interface ScheduleConfig {
    bookmarks?: string
    icalPrefix?: string
    icalDomain?: string
  }
}

export type AppContext = {
  config: RequiredScheduleConfig
  bookmarkAPI: BookmarkAPI | undefined
}

export const loadApp = async (
  queryClient: QueryClient,
  configURL: string
): Promise<AppContext> => {
  const config = await queryClient.fetchQuery(
    getScheduleConfigQueryOptions(configURL)
  )

  let bookmarkAPI: BookmarkAPI | undefined

  if (config.bookmarks) {
    bookmarkAPI = makeBookmarkAPI(config.bookmarks)
    try {
      await bookmarkAPI.setup()
    } catch (_) {
      bookmarkAPI = undefined
    }
  }

  // local storage sync
  listenForStorageUpdates(config.id, (selections) => {
    queryClient
      .getMutationCache()
      .build(
        queryClient,
        getStoredBookmarksMutationOptions(queryClient, config.id)
      )
      .execute(selections)
  })

  return {
    config,
    bookmarkAPI,
  }
}

export const getScheduleConfigQueryOptions = (
  url: string
): UseSuspenseQueryOptions<RequiredScheduleConfig> => {
  return {
    queryKey: ["config", { url: url }],
    async queryFn() {
      return await wretch(url).get().json<RequiredScheduleConfig>()
    },
    staleTime: Infinity,
  }
}
