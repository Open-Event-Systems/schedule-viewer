import { UseSuspenseQueryOptions } from "@tanstack/react-query"
import {
  BookmarkAPI,
  BookmarkCountsResponse,
  BookmarkSetupResponse,
  BookmarksRequest,
  BookmarksResponse,
  Selections,
  SessionBookmarksResponse,
} from "./types.js"
import wretch from "wretch"
import { makeSelections } from "./selections.js"
import { formatISO, isAfter, parseISO } from "date-fns"

const LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-bookmarks-v1-"

export type BookmarkServiceAPI = BookmarkAPI &
  Readonly<{
    sessionId: string
    getBookmarkCounts(): Promise<BookmarkCountsResponse>
  }>

/**
 * Create a {@link BookmarkAPI} backed by local storage.
 */
export const makeLocalStorageBookmarkAPI = (
  scheduleId: string,
): BookmarkAPI => {
  const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`

  return {
    async getBookmarks() {
      return null
    },
    async getSessionBookmarks() {
      const asStr = window.localStorage.getItem(localStorageKey)
      if (!asStr) {
        return { events: [] }
      }
      try {
        const data = JSON.parse(asStr)
        return parseBookmarks(data)
      } catch (_e) {
        return { events: [] }
      }
    },
    async setSessionBookmarks(events) {
      const data = { date: formatISO(new Date()), events: [...events] }
      const asStr = JSON.stringify(data)
      window.localStorage.setItem(localStorageKey, asStr)

      return data
    },
  }
}

const parseBookmarks = (data: unknown): SessionBookmarksResponse => {
  if (!data || typeof data != "object" || !("events" in data)) {
    return { events: [] }
  }

  const events =
    Array.isArray(data.events) &&
    data.events.every((it) => typeof it == "string")
      ? data.events
      : []
  const date =
    "date" in data && typeof data.date == "string" ? data.date : undefined

  return { events, date }
}

/**
 * Return a Promise for a {@link BookmarkServiceAPI}.
 */
export const setupBookmarkServiceAPI = async (
  baseURL: string,
  sessionId?: string,
): Promise<BookmarkServiceAPI> => {
  const baseWretch = wretch(baseURL, { credentials: "include" })

  // setup
  let req = baseWretch.url("/setup-bookmarks")
  if (sessionId) {
    req = req.json({ sessionId })
  }

  const res = await req.put().json<BookmarkSetupResponse>()

  return {
    sessionId: res.sessionId,
    async getBookmarks(selectionsId) {
      return await baseWretch
        .url(`/bookmarks/${selectionsId}`)
        .get()
        .notFound(() => null)
        .json<BookmarksResponse | null>()
    },
    async getSessionBookmarks() {
      return await baseWretch
        .url("/bookmarks")
        .get()
        .json<SessionBookmarksResponse>()
    },
    async setSessionBookmarks(events) {
      const body: BookmarksRequest = {
        events: [...events],
      }

      return await baseWretch
        .url("/bookmarks")
        .json(body)
        .put()
        .json<SessionBookmarksResponse>()
    },
    async getBookmarkCounts() {
      return await baseWretch
        .url("/counts")
        .get()
        .json<BookmarkCountsResponse>()
    },
  }
}

/**
 * Compose two {@link BookmarkAPI} objects.
 */
export const composeBookmarkAPI = (
  a: BookmarkAPI,
  b: BookmarkAPI,
): BookmarkAPI => {
  return {
    async getBookmarks(selectionsId) {
      const res = await a.getBookmarks(selectionsId)
      if (res) {
        return res
      } else {
        return await b.getBookmarks(selectionsId)
      }
    },
    async getSessionBookmarks() {
      const [aRes, bRes] = await Promise.all([
        a.getSessionBookmarks().catch(() => null),
        b.getSessionBookmarks().catch(() => null),
      ])
      return pickMoreRecent(aRes, bRes)
    },
    async setSessionBookmarks(events) {
      const [aRes, bRes] = await Promise.all([
        a.setSessionBookmarks(events),
        b.setSessionBookmarks(events),
      ])

      return pickMoreRecent(aRes, bRes)
    },
  }
}

/**
 * Sync two bookmark APIs to have the latest data.
 */
export const syncBookmarkAPIs = async (
  a: BookmarkAPI,
  b: BookmarkAPI,
): Promise<SessionBookmarksResponse> => {
  const [aRes, bRes] = await Promise.all([
    a.getSessionBookmarks(),
    b.getSessionBookmarks(),
  ])

  if (!eventsEqual(aRes.events, bRes.events)) {
    const newest = pickMoreRecent(aRes, bRes)
    if (!eventsEqual(aRes.events, newest.events)) {
      return await a.setSessionBookmarks(newest.events)
    } else {
      return await b.setSessionBookmarks(newest.events)
    }
  } else {
    return pickMoreRecent(aRes, bRes)
  }
}

const eventsEqual = (a: Iterable<string>, b: Iterable<string>): boolean => {
  const aSet = new Set(a)
  const bSet = new Set(b)
  return aSet.size == bSet.size && [...aSet].every((v) => bSet.has(v))
}

const pickMoreRecent = (
  a: SessionBookmarksResponse | null,
  b: SessionBookmarksResponse | null,
): SessionBookmarksResponse => {
  if (a?.date && b?.date) {
    const aDate = parseISO(a.date)
    const bDate = parseISO(b.date)
    if (isAfter(aDate, bDate)) {
      return a
    } else {
      return b
    }
  } else if (a?.date && !b?.date) {
    return a
  } else if (!a?.date && b?.date) {
    return b
  } else {
    return { events: [] }
  }
}

// export const getBookmarksByIdQueryOptions = (
//   bookmarkAPI: BookmarkAPI,
//   scheduleId: string,
//   selectionsId: string,
// ): UseSuspenseQueryOptions<Selections | null> => {
//   return {
//     queryKey: ["schedule", scheduleId, "bookmarks", selectionsId],
//     async queryFn() {
//       const resp = await bookmarkAPI.getBookmarks(selectionsId)
//       return resp ? makeSelections(resp.events) : null
//     }
//   }
// }

// export const getSessionBookmarksQueryOptions = (
//   bookmarkAPI: BookmarkAPI,
//   scheduleId: string,
// ): UseSuspenseQueryOptions<Selections> => {
//   return {
//     queryKey: ["schedule", scheduleId, "bookmarks"],
//     async queryFn() {
//       const res = await bookmarkAPI.getSessionBookmarks()
//       return makeSelections(res.events, parseISO(res.date))
//     },
//     staleTime: Infinity,
//   }
// }
