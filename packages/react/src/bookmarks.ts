import {
  BookmarkAPI,
  BookmarkServiceAPI,
  composeBookmarkAPI,
  makeLocalStorageBookmarkAPI,
  setupBookmarkServiceAPI,
  syncBookmarkAPIs,
} from "@open-event-systems/schedule-lib"
import { ScheduleConfig } from "./config/config.js"
import { createContext, useContext } from "react"

/**
 * Set up the bookmarks API.
 */
export const setupBookmarks = async (
  config: ScheduleConfig,
  sessionId?: string,
): Promise<[BookmarkAPI, BookmarkServiceAPI | null]> => {
  const local = makeLocalStorageBookmarkAPI(config.id)
  if (!config.bookmarks) {
    return [local, null]
  }

  try {
    const remote = await setupBookmarkServiceAPI(config.bookmarks, sessionId)

    await syncBookmarkAPIs(local, remote)

    const composed = composeBookmarkAPI(local, remote)
    return [composed, remote]
  } catch (e) {
    console.error(`Ignoring remote bookmark serivce: ${e}`)
    return [local, null]
  }
}

export const BookmarkAPIContext = createContext<
  readonly [BookmarkAPI, BookmarkServiceAPI | null]
>([makeLocalStorageBookmarkAPI(""), null])
export const BookmarkAPIProvider = BookmarkAPIContext.Provider
export const useBookmarkAPI = (): BookmarkAPI =>
  useContext(BookmarkAPIContext)[0]
export const useBookmarkServiceAPI = (): BookmarkServiceAPI | null =>
  useContext(BookmarkAPIContext)[1]
