import {
  BookmarkAPI,
  BookmarksRequest,
  BookmarksResponse,
  SessionBookmarksResponse,
} from "./types.js"
import wretch from "wretch"

export const makeBookmarkAPI = (baseURL: string): BookmarkAPI => {
  const baseWretch = wretch(baseURL, { credentials: "include" })
  return {
    async setup() {
      await baseWretch.url("/setup-bookmarks").put().res()
    },
    async getBookmarks(selectionId: string) {
      const res = await baseWretch
        .url(`/bookmarks/${selectionId}`)
        .get()
        .json<BookmarksResponse>()
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
  }
}
