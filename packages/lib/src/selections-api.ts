import { formatISO, isAfter } from "date-fns"
import { makeSelections, parseSelections } from "./selections.js"
import type {
  Selections,
  SelectionsAPI,
  SelectionsServiceAPI,
  SelectionsType,
} from "./types.js"
import wretch from "wretch"
import { setEquals } from "./utils.js"

const SELECTIONS_LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-selections-v1-"
const SESSION_LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-selections-session-v1-"

type BookmarkCountsResponse = {
  counts: Record<string, number>
}

type SelectionsResponse = {
  selections: {
    id: string
    items: string[]
  }
}

type SessionSelectionsResponse = {
  session_selections: {
    selections: {
      id: string
      items: string[]
    }
    date?: string
    url: string
  }
}

type UpdateSelectionsRequest = {
  selections?: {
    items: string[]
  }
  add?: string[]
  remove?: string[]
}

type BookmarkSetupBody = {
  session_id: string
}

export const makeLocalStorageSelectionsAPI = (
  scheduleId: string,
): SelectionsAPI => {
  const storageKey = (type: string) =>
    `${SELECTIONS_LOCAL_STORAGE_KEY_PREFIX}${type}-${scheduleId}`

  return {
    async getSelections() {
      return null
    },
    async getSessionSelections(type) {
      const key = storageKey(type)
      const asStr = window.localStorage.getItem(key)
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
    async setSessionSelections(type, selections) {
      const data: Record<string, unknown> = {
        items: [...selections.items],
      }

      if (selections.date) {
        data.date = formatISO(selections.date)
      }

      if (selections.id) {
        data.id = selections.id
      }

      const asStr = JSON.stringify(data)
      window.localStorage.setItem(storageKey(type), asStr)

      return selections
    },
    async updateSessionSelections(type, options) {
      const curSelections = await this.getSessionSelections(type)
      const newItems = new Set(curSelections.items)
      for (const item of options.add ?? []) {
        newItems.add(item)
      }
      for (const item of options.remove ?? []) {
        newItems.delete(item)
      }

      const date = new Date()

      const data: Record<string, unknown> = {
        items: [...newItems],
        date: formatISO(date),
      }

      const asStr = JSON.stringify(data)
      window.localStorage.setItem(storageKey(type), asStr)

      return makeSelections(newItems, date)
    },
  }
}

export const setupSelectionsServiceAPI = async (
  baseURL: string,
  scheduleId: string,
  sessionId?: string,
): Promise<SelectionsServiceAPI> => {
  const baseWretch = wretch(baseURL).url(`/schedules/${scheduleId}`)
  const localStorageKey = `${SESSION_LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`
  const loadSessId = window.localStorage.getItem(localStorageKey)
  const setupSessId = sessionId || loadSessId

  // setup
  let req = baseWretch.url("/setup-session")
  if (setupSessId) {
    req = req.json({ session_id: setupSessId })
  }

  const res = await req.post().json<BookmarkSetupBody>()

  sessionId = res.session_id
  window.localStorage.setItem(localStorageKey, sessionId)

  return {
    sessionId: sessionId,
    async getSelections(selectionsId) {
      const res = await baseWretch
        .url(`/selections/${selectionsId}`)
        .get()
        .notFound(() => null)
        .json<SelectionsResponse | null>()

      if (res == null) {
        return null
      }

      return parseSelections(res.selections)
    },
    async getSessionSelections(type) {
      const res = await baseWretch
        .url(`/session-selections/${type}`)
        .auth(`Bearer ${sessionId}`)
        .get()
        .json<SessionSelectionsResponse>()

      return parseSelections({
        ...res.session_selections.selections,
        date: res.session_selections.date,
      })
    },
    async setSessionSelections(type, selections) {
      const body: UpdateSelectionsRequest = {
        selections: {
          items: [...selections.items],
        },
      }

      const res = await baseWretch
        .url(`/session-selections/${type}`)
        .auth(`Bearer ${sessionId}`)
        .json(body)
        .put()
        .json<SessionSelectionsResponse>()

      return parseSelections({
        ...res.session_selections.selections,
        date: res.session_selections.date,
      })
    },
    async updateSessionSelections(type, options) {
      const body: UpdateSelectionsRequest = {
        add: [...(options.add ?? [])],
        remove: [...(options.remove ?? [])],
      }

      const res = await baseWretch
        .url(`/session-selections/${type}`)
        .auth(`Bearer ${sessionId}`)
        .json(body)
        .put()
        .json<SessionSelectionsResponse>()

      return parseSelections({
        ...res.session_selections.selections,
        date: res.session_selections.date,
      })
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
 * Compose a local and remote {@link SelectionsAPI} object.
 */
export const composeSelectionsAPI = (
  local: SelectionsAPI,
  remote?: SelectionsServiceAPI | null,
): SelectionsAPI | SelectionsServiceAPI => {
  const methods: SelectionsAPI = {
    async getSelections(selectionsId) {
      if (remote) {
        return await remote.getSelections(selectionsId)
      } else {
        return null
      }
    },
    async getSessionSelections(type) {
      if (!remote) {
        return await local.getSessionSelections(type)
      }

      const [localRes, remoteRes] = await Promise.all([
        local.getSessionSelections(type).catch(() => undefined),
        remote.getSessionSelections(type).catch(() => undefined),
      ])

      return pickMoreRecent(localRes, remoteRes)
    },
    async setSessionSelections(type, selections) {
      if (!remote) {
        return await local.getSessionSelections(type)
      }

      const [localRes, remoteRes] = await Promise.all([
        local.setSessionSelections(type, selections),
        remote.setSessionSelections(type, selections),
      ])

      return pickMoreRecent(localRes, remoteRes)
    },
    async updateSessionSelections(type, options) {
      if (!remote) {
        return await local.updateSessionSelections(type, options)
      }

      const remoteRes = await remote
        .updateSessionSelections(type, options)
        .catch(() => undefined)
      let localRes

      if (remoteRes) {
        localRes = await local.setSessionSelections(type, remoteRes)
      } else {
        localRes = await local.updateSessionSelections(type, options)
      }

      return pickMoreRecent(localRes, remoteRes)
    },
  }

  if (remote) {
    return {
      ...methods,
      get sessionId() {
        return remote.sessionId
      },
      async getBookmarkCounts() {
        return await remote.getBookmarkCounts()
      },
    }
  }

  return methods
}

/**
 * Sync local/remote selections APIs to have the latest data.
 */
export const syncSelectionsAPIs = async (
  local: SelectionsAPI,
  remote: SelectionsAPI,
  type: SelectionsType,
): Promise<Selections> => {
  const [localRes, remoteRes] = await Promise.all([
    local.getSessionSelections(type),
    remote.getSessionSelections(type),
  ])

  if (!setEquals(localRes.items, remoteRes.items)) {
    const newest = pickMoreRecent(localRes, remoteRes)
    if (!setEquals(localRes.items, newest.items)) {
      return await local.setSessionSelections(type, newest)
    } else {
      const remoteLatest = await remote.setSessionSelections(type, newest)
      return await local.setSessionSelections(type, remoteLatest)
    }
  } else {
    return pickMoreRecent(localRes, remoteRes)
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
