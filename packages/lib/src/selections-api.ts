import { formatISO } from "date-fns"
import type {
  Selections,
  SelectionsAPI,
  SelectionsType,
  ServerSelections,
  SessionSelections,
  SessionSelectionsStore,
} from "./types.js"
import wretch from "wretch"
import {
  makeSelections,
  makeSessionSelections,
  parseSelections,
  parseSessionSelections,
  sessionSelectionsStorageSchema,
} from "./selections.js"

const SELECTIONS_LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-selections-v2-"
const SESSION_LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-selections-session-v2-"

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

/**
 * A {@link SessionSelectionsStore} that stores and returns nothing.
 */
export const makeNullSessionSelectionsStore = (): SessionSelectionsStore => {
  return {
    add() {
      return makeSessionSelections()
    },
    delete() {
      return makeSessionSelections()
    },
    get() {
      return {
        base: makeSessionSelections(),
        current: makeSessionSelections(),
        added: new Set(),
        deleted: new Set(),
      }
    },
    save() {},
  }
}

export const makeSessionSelectionsStore = (
  scheduleId: string,
): SessionSelectionsStore => {
  const storageKey = (type: string) =>
    `${SELECTIONS_LOCAL_STORAGE_KEY_PREFIX}${type}-${scheduleId}`

  const selectionsToObj = (selections: Selections | ServerSelections) => {
    return {
      items: [...selections],
      ...("id" in selections && selections.id && { id: selections.id }),
    }
  }

  const sessionSelectionsToObj = (ssels: SessionSelections) => {
    return {
      selections: selectionsToObj(ssels.selections),
      ...(ssels.date && { date: formatISO(ssels.date) }),
    }
  }

  return {
    get(type) {
      const key = storageKey(type)
      const asStr = window.localStorage.getItem(key)

      if (asStr) {
        try {
          const data = JSON.parse(asStr)
          const parsed = sessionSelectionsStorageSchema.parse(data)
          const baseSels = makeSelections(
            parsed.base.selections.items,
            parsed.base.selections.id,
          )
          const base = makeSessionSelections(baseSels, parsed.base.date)

          const currentSels = makeSelections(
            parsed.current.selections.items,
            parsed.current.selections.id,
          )
          const current = makeSessionSelections(
            currentSels,
            parsed.current.date,
          )

          return {
            base,
            current,
            added: new Set(parsed.added),
            deleted: new Set(parsed.deleted),
          }
        } catch (_e) {
          // do nothing
        }
      }

      return {
        base: makeSessionSelections(),
        added: new Set(),
        deleted: new Set(),
        current: makeSessionSelections(),
      }
    },
    save(type, selections) {
      const key = storageKey(type)

      const sselsObj = sessionSelectionsToObj(selections)

      const asObj = {
        base: sselsObj,
        current: sselsObj,
        added: [],
        deleted: [],
      }

      window.localStorage.setItem(key, JSON.stringify(asObj))
    },
    add(type, itemId) {
      const status = this.get(type)
      const key = storageKey(type)

      if (status.current.selections.has(itemId)) {
        return status.current
      }

      const newAdded = new Set(status.added)
      const newDeleted = new Set(status.deleted)

      if (newDeleted.has(itemId)) {
        newDeleted.delete(itemId)
      } else {
        newAdded.add(itemId)
      }

      const newSels = status.current.selections.add(itemId)
      const newCurrent = makeSessionSelections(newSels, new Date())

      const asObj = {
        base: sessionSelectionsToObj(status.base),
        added: [...newAdded],
        deleted: [...status.deleted],
        current: sessionSelectionsToObj(newCurrent),
      }

      window.localStorage.setItem(key, JSON.stringify(asObj))

      return newCurrent
    },
    delete(type, itemId) {
      const status = this.get(type)
      const key = storageKey(type)

      if (!status.current.selections.has(itemId)) {
        return status.current
      }

      const newAdded = new Set(status.added)
      const newDeleted = new Set(status.deleted)

      if (newAdded.has(itemId)) {
        newAdded.delete(itemId)
      } else {
        newDeleted.add(itemId)
      }

      const newSels = status.current.selections.delete(itemId)
      const newCurrent = makeSessionSelections(newSels, new Date())

      const asObj = {
        base: sessionSelectionsToObj(status.base),
        added: [...newAdded],
        deleted: [...status.deleted],
        current: sessionSelectionsToObj(newCurrent),
      }

      window.localStorage.setItem(key, JSON.stringify(asObj))

      return newCurrent
    },
  }
}

export const setupSelectionsAPI = async (
  baseURL: string,
  scheduleId: string,
  sessionId?: string,
): Promise<SelectionsAPI> => {
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

      return parseSessionSelections(res.session_selections)
    },
    async updateSessionSelections(type, options) {
      const body: UpdateSelectionsRequest = {
        add: [...(options.add ?? [])],
        remove: [...(options.delete ?? [])],
      }

      const res = await baseWretch
        .url(`/session-selections/${type}`)
        .auth(`Bearer ${sessionId}`)
        .json(body)
        .put()
        .json<SessionSelectionsResponse>()

      return parseSessionSelections(res.session_selections)
    },
    async getBookmarkCounts() {
      const resp = await baseWretch
        .url("/counts")
        .get()
        .json<BookmarkCountsResponse>()
      return new Map(Object.entries(resp.counts))
    },
  }
}

/**
 * Compose a {@link SessionSelectionsStore} and remote {@link SelectionsAPI} object.
 */
export const composeSelectionsAPI = (
  local: SessionSelectionsStore,
  remote?: SelectionsAPI | null,
): SelectionsAPI => {
  return {
    sessionId: remote?.sessionId,
    async getSelections(selectionsId) {
      if (remote) {
        return await remote.getSelections(selectionsId)
      } else {
        return null
      }
    },
    async getSessionSelections(type) {
      if (remote) {
        const res = await remote.getSessionSelections(type)
        local.save(type, res)
        return res
      } else {
        return local.get(type).current
      }
    },
    async updateSessionSelections(type, options) {
      for (const add of options.add ?? []) {
        local.add(type, add)
      }

      for (const del of options.delete ?? []) {
        local.delete(type, del)
      }

      if (remote) {
        const res = await remote.updateSessionSelections(type, {
          add: [...(options.add ?? [])],
          delete: [...(options.delete ?? [])],
        })
        local.save(type, res)
        return res
      } else {
        return local.get(type).current
      }
    },
    async getBookmarkCounts() {
      if (remote) {
        return await remote.getBookmarkCounts()
      } else {
        return new Map()
      }
    },
  }
}

/**
 * Sync local/remote selections APIs to have the latest data.
 */
export const syncSelectionsAPIs = async (
  local: SessionSelectionsStore,
  remote: SelectionsAPI,
  type: SelectionsType,
): Promise<SessionSelections> => {
  const curLocal = local.get(type)
  if (curLocal.added.size > 0 || curLocal.deleted.size > 0) {
    const res = await remote.updateSessionSelections(type, {
      add: [...curLocal.added],
      delete: [...curLocal.deleted],
    })
    local.save(type, res)
    return res
  } else {
    const res = await remote.getSessionSelections(type)
    local.save(type, res)
    return res
  }
}
