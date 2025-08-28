import { BookmarkAPI, Selections } from "./types.js"
import wretch from "wretch"
import { formatISO, isAfter, parseISO } from "date-fns"
import { makeSelections } from "./selections.js"
import { setEquals } from "./utils.js"

const LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-bookmarks-v1-"

export type BookmarkCounts = Readonly<{
  counts: Readonly<Record<string, number>>
}>

export type BookmarksResponse = Readonly<{
  id: string
  events: readonly string[]
}>

export type SessionBookmarksResponse = Readonly<{
  id?: string
  date?: string
  events: readonly string[]
}>

export type BookmarksRequest = Readonly<{
  events: readonly string[]
}>

export type BookmarkSetupResponse = Readonly<{
  sessionId: string
}>

export type BookmarkServiceAPI = BookmarkAPI &
  Readonly<{
    sessionId: string
    getBookmarkCounts(): Promise<BookmarkCounts>
  }>

/**
 * Create a {@link BookmarkAPI} backed by local storage.
 */
export const makeLocalStorageBookmarkAPI = (
  scheduleId: string,
): BookmarkAPI => {
  const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`

  return {
    async getSelections() {
      return null
    },
    async getSessionSelections() {
      const asStr = window.localStorage.getItem(localStorageKey)
      if (!asStr) {
        return makeSelections()
      }
      try {
        const data = JSON.parse(asStr)
        return parseBookmarks(data)
      } catch (_e) {
        return makeSelections()
      }
    },
    async setSessionSelections(selections) {
      const data: Record<string, unknown> = {
        events: [...selections.events],
      }

      if (selections.date) {
        data.dateUpdated = formatISO(selections.date)
      }

      if (selections.id) {
        data.id = selections.id
      }

      const asStr = JSON.stringify(data)
      window.localStorage.setItem(localStorageKey, asStr)

      return selections
    },
  }
}

const parseBookmarks = (data: unknown): Selections => {
  if (!data || typeof data != "object" || !("events" in data)) {
    return makeSelections()
  }

  const events =
    Array.isArray(data.events) &&
    data.events.every((it) => typeof it == "string")
      ? data.events
      : []
  let date =
    "date" in data && typeof data.date == "string"
      ? parseISO(data.date)
      : undefined
  const id = "id" in data && typeof data.id == "string" ? data.id : undefined

  if (date && isNaN(date.getTime())) {
    date = undefined
  }

  return makeSelections(events, date, id)
}

/**
 * Remove local storage selections.
 */
export const clearSelections = (scheduleId: string) => {
  const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`
  window.localStorage.removeItem(localStorageKey)
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
    async getSelections(selectionsId) {
      const res = await baseWretch
        .url(`/bookmarks/${selectionsId}`)
        .get()
        .notFound(() => null)
        .json<BookmarksResponse | null>()

      if (res == null) {
        return null
      }

      return makeSelections(res.events, undefined, res.id)
    },
    async getSessionSelections() {
      const res = await baseWretch
        .url("/bookmarks")
        .get()
        .json<SessionBookmarksResponse>()

      return responseToSelections(res)
    },
    async setSessionSelections(selections) {
      const body: BookmarksRequest = {
        events: [...selections.events],
      }

      const res = await baseWretch
        .url("/bookmarks")
        .json(body)
        .put()
        .json<SessionBookmarksResponse>()

      return responseToSelections(res)
    },
    async getBookmarkCounts() {
      return await baseWretch.url("/counts").get().json<BookmarkCounts>()
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
    async getSelections(selectionsId) {
      const res = await a.getSelections(selectionsId)
      if (res) {
        return res
      } else {
        return await b.getSelections(selectionsId)
      }
    },
    async getSessionSelections() {
      const [aRes, bRes] = await Promise.all([
        a.getSessionSelections().catch(() => null),
        b.getSessionSelections().catch(() => null),
      ])

      return pickMoreRecent(aRes, bRes)
    },
    async setSessionSelections(selections) {
      const [aRes, bRes] = await Promise.all([
        a.setSessionSelections(selections),
        b.setSessionSelections(selections),
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
): Promise<Selections> => {
  const [aRes, bRes] = await Promise.all([
    a.getSessionSelections(),
    b.getSessionSelections(),
  ])

  if (!setEquals(aRes.events, bRes.events)) {
    const newest = pickMoreRecent(aRes, bRes)
    if (!setEquals(aRes.events, newest.events)) {
      return await a.setSessionSelections(newest)
    } else {
      return await b.setSessionSelections(newest)
    }
  } else {
    return pickMoreRecent(aRes, bRes)
  }
}

const responseToSelections = (resp: SessionBookmarksResponse): Selections => {
  const dateObj = resp.date ? parseISO(resp.date) : undefined
  return makeSelections(resp.events, dateObj, resp.id)
}

const pickMoreRecent = (
  a: Selections | null,
  b: Selections | null,
): Selections => {
  if (a?.date && b?.date) {
    if (isAfter(a.date, b.date)) {
      return a
    } else {
      return b
    }
  } else if (a?.date && !b?.date) {
    return a
  } else if (!a?.date && b?.date) {
    return b
  } else {
    return a ?? makeSelections()
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
