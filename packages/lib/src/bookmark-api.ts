import {
  BookmarkAPI,
  BookmarkCountsResponse,
  BookmarkSetupResponse,
  BookmarksRequest,
  BookmarksResponse,
  SessionBookmarksResponse,
} from "./types.js"
import wretch from "wretch"

export const makeBookmarkAPI = (baseURL: string): BookmarkAPI => {
  const baseWretch = wretch(baseURL, { credentials: "include" })
  return {
    async setup(sessionId) {
      let req = baseWretch.url("/setup-bookmarks")
      if (sessionId) {
        req = req.json({ sessionId })
      }
      return await req.put().json<BookmarkSetupResponse>()
    },
    async getBookmarks(selectionId: string) {
      const res = await baseWretch
        .url(`/bookmarks/${selectionId}`)
        .get()
        .notFound(() => null)
        .json<BookmarksResponse | null>()
      return res
    },
    async getSessionBookmarks() {
      const res = await baseWretch
        .url("/bookmarks")
        .get()
        .json<SessionBookmarksResponse>()
      return res
    },
    async setBookmarks(events: Iterable<string>) {
      const body: BookmarksRequest = {
        events: Array.from(events),
      }
      const res = await baseWretch
        .url("/bookmarks")
        .json(body)
        .put()
        .json<SessionBookmarksResponse>()
      return res
    },
    async getBookmarkCounts() {
      return await baseWretch
        .url("/counts")
        .get()
        .json<BookmarkCountsResponse>()
    },
  }
}
