import { BookmarkAPI, BookmarkServiceAPI, Selections } from "./types.js"
import wretch from "wretch"
import { formatISO, isAfter } from "date-fns"
import { makeSelections, parseSelections } from "./selections.js"
import { setEquals } from "./utils.js"

const BOOKMARKS_LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-bookmarks-v1-"
const SESSION_LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-bookmarks-session-v1-"

type BookmarkCountsResponse = {
  counts: Record<string, number>
}

type BookmarksResponse = {
  selections: {
    id: string
    events: string[]
  }
}

type SessionBookmarksResponse = {
  selections: {
    id?: string
    date?: string
    events: string[]
  }
}

type BookmarksRequest = {
  selections: {
    events: string[]
  }
}

type BookmarkSetupResponse = {
  sessionId: string
}

/**
 * Create a {@link BookmarkAPI} backed by local storage.
 */
export const makeLocalStorageBookmarkAPI = (
  scheduleId: string,
): BookmarkAPI => {
  const localStorageKey = `${BOOKMARKS_LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`

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
        return parseSelections(data)
      } catch (_e) {
        return makeSelections()
      }
    },
    async setSessionSelections(selections) {
      const data: Record<string, unknown> = {
        events: [...selections.events],
      }

      if (selections.date) {
        data.date = formatISO(selections.date)
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

/**
 * Remove local storage selections.
 */
export const clearSelections = (scheduleId: string) => {
  const localStorageKey = `${BOOKMARKS_LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`
  window.localStorage.removeItem(localStorageKey)
}

/**
 * Return a Promise for a {@link BookmarkServiceAPI}.
 */
export const setupBookmarkServiceAPI = async (
  baseURL: string,
  scheduleId: string,
  sessionId?: string,
): Promise<BookmarkServiceAPI> => {
  const baseWretch = wretch(baseURL)

  // setup
  let req = baseWretch.url("/setup-bookmarks")
  if (sessionId) {
    req = req.json({ sessionId })
  }

  const res = await req.put().json<BookmarkSetupResponse>()

  const localStorageKey = `${SESSION_LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`

  sessionId = res.sessionId
  window.localStorage.setItem(localStorageKey, sessionId)

  return {
    sessionId: sessionId,
    async getSelections(selectionsId) {
      const res = await baseWretch
        .url(`/bookmarks/${selectionsId}`)
        .get()
        .notFound(() => null)
        .json<BookmarksResponse | null>()

      if (res == null) {
        return null
      }

      return parseSelections(res.selections)
    },
    async getSessionSelections() {
      const res = await baseWretch
        .url("/bookmarks")
        .auth(`Bearer ${sessionId}`)
        .get()
        .json<SessionBookmarksResponse>()

      return parseSelections(res.selections)
    },
    async setSessionSelections(selections) {
      const body: BookmarksRequest = {
        selections: {
          events: [...selections.events],
        },
      }

      const res = await baseWretch
        .url("/bookmarks")
        .auth(`Bearer ${sessionId}`)
        .json(body)
        .put()
        .json<SessionBookmarksResponse>()

      return parseSelections(res.selections)
    },
    async getBookmarkCounts() {
      const resp = await baseWretch
        .url("/counts")
        .get()
        .json<BookmarkCountsResponse>()
      return resp.counts
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
        a.getSessionSelections().catch(() => undefined),
        b.getSessionSelections().catch(() => undefined),
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

const pickMoreRecent = (
  a: Selections | undefined,
  b: Selections | undefined,
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
