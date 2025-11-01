import {
  type BookmarkAPI,
  type BookmarkServiceAPI,
  composeBookmarkAPI,
  makeLocalStorageBookmarkAPI,
  setupBookmarkServiceAPI,
  syncBookmarkAPIs,
} from "@open-event-systems/schedule-lib"
import type { ScheduleConfig } from "./types.js"

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
    const remote = await setupBookmarkServiceAPI(
      config.bookmarks,
      config.id,
      sessionId,
    )

    await syncBookmarkAPIs(local, remote)

    const composed = composeBookmarkAPI(local, remote)
    return [composed, remote]
  } catch (e) {
    console.error(`Ignoring remote bookmark serivce: ${e}`)
    return [local, null]
  }
}
