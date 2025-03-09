import {
  makeBookmarkAPI,
  makeBookmarkStore,
  SessionBookmarksResponse,
} from "@open-event-systems/schedule-lib"
import {
  BookmarkAPI,
  BookmarkStore,
  RequiredScheduleConfig,
} from "@open-event-systems/schedule-lib"
import { QueryClient, UseQueryOptions } from "@tanstack/react-query"
import {
  BookmarkAPIBookmarkStore,
  getSessionBookmarksMutationOptions,
  getSessionBookmarksQueryOptions,
  LocalStorageBookmarkStore,
  makeBookmarkAPIBookmarkStoreFactory,
  withUseNewerData,
} from "./bookmarks.js"
import { isAfter, parseISO } from "date-fns"

declare module "@open-event-systems/schedule-lib" {
  interface ScheduleConfig {
    bookmarks?: string
    icalPrefix?: string
    icalDomain?: string
  }
}

export type AppContext = {
  config: RequiredScheduleConfig
  bookmarkStore: BookmarkStore
  bookmarkAPI: BookmarkAPI | undefined
}

export const getAppContextQueryOptions = (
  queryClient: QueryClient,
  configURL: string
): UseQueryOptions<AppContext> => {
  return {
    queryKey: ["app", { url: configURL }],
    async queryFn() {
      const config = await queryClient.fetchQuery(
        getScheduleConfigQueryOptions(configURL)
      )

      let bookmarkAPI: BookmarkAPI | undefined
      let fetchedBookmarks: SessionBookmarksResponse | undefined
      let factory = makeBookmarkStore

      if (config.bookmarks) {
        bookmarkAPI = makeBookmarkAPI(config.bookmarks)
        try {
          await bookmarkAPI.setup()
          fetchedBookmarks = await queryClient.fetchQuery(
            getSessionBookmarksQueryOptions(bookmarkAPI, config.id)
          )

          const mutation = queryClient
            .getMutationCache()
            .build(
              queryClient,
              getSessionBookmarksMutationOptions(
                queryClient,
                bookmarkAPI,
                config.id
              )
            )
          factory = makeBookmarkAPIBookmarkStoreFactory(
            makeBookmarkStore,
            (ids: Iterable<string>) => mutation.execute(ids)
          )
        } catch (_) {
          bookmarkAPI = undefined
        }
      }

      const fetchedDate = fetchedBookmarks?.date
        ? parseISO(fetchedBookmarks.date)
        : undefined
      const bookmarkStore = LocalStorageBookmarkStore.load(
        withUseNewerData(factory, fetchedBookmarks?.events, fetchedDate),
        config.id
      )

      console.log("bookmarks", bookmarkStore.eventIds)

      const api = {
        config,
        bookmarkAPI,
        bookmarkStore,
      }

      return api
    },
    staleTime: Infinity,
  }
}

export const getScheduleConfigQueryOptions = (
  url: string
): UseQueryOptions<RequiredScheduleConfig> => {
  return {
    queryKey: ["config", { url: url }],
    async queryFn() {
      const resp = await fetch(url)
      if (!resp.ok) {
        throw new Error(`Schedule config request returned ${resp.status}`)
      }
      return (await resp.json()) as RequiredScheduleConfig
    },
    staleTime: Infinity,
  }
}
