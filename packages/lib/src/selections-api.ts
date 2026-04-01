import type {
  SelectionsType,
  LocalSessionSelections,
  LocalSessionSelectionsStore,
  SessionSelectionsAPI,
  ServerSelectionsAPI,
  ServerSessionSelectionsAPI,
} from "./types.js"
import wretch from "wretch"
import {
  encodeLocalSessionSelections,
  makeLocalSessionSelections,
  parseLocalSessionSelections,
  parseServerSelections,
  parseServerSessionSelections,
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
 * A {@link SessionSelectionsStore} that stores data in memory.
 */
export const makeMemoryLocalSelectionsStore =
  (): LocalSessionSelectionsStore => {
    let cur = makeLocalSessionSelections()
    const observers: (() => void)[] = []

    const notify = () => {
      observers.forEach((o) => o())
    }

    return {
      get: () => cur,
      add: (items) => {
        cur = cur.add(...items)
        notify()
        return cur
      },
      delete: (items) => {
        cur = cur.delete(...items)
        notify()
        return cur
      },
      save: (newSels) => {
        cur = newSels
        notify()
        return cur
      },
      subscribe: (cb) => {
        const unsub = () => {
          const idx = observers.findIndex((o) => o == cb)
          if (idx != -1) {
            observers.splice(idx, 1)
          }
        }
        observers.push(cb)
        return unsub
      },
    }
  }

export type LocalStorageSelectionsStore = LocalSessionSelectionsStore &
  Readonly<{
    handleEvent: (e: StorageEvent) => void
  }>

export const makeLocalStorageSessionSelectionsStore = (
  type: SelectionsType,
  scheduleId: string,
  storage?: Storage,
): LocalStorageSelectionsStore => {
  storage = storage ?? window.localStorage
  const storageKey = `${SELECTIONS_LOCAL_STORAGE_KEY_PREFIX}${type}-${scheduleId}`
  const observers: (() => void)[] = []

  const getFromStorage = (): LocalSessionSelections | undefined => {
    try {
      const dataStr = storage.getItem(storageKey)
      if (!dataStr) {
        return
      }

      const data = JSON.parse(dataStr)
      return parseLocalSessionSelections(data)
    } catch (e) {
      console.warn(`failed to load selections from storage: ${e}`)
      return
    }
  }

  const saveToStorage = (lsels: LocalSessionSelections) => {
    const data = encodeLocalSessionSelections(lsels)
    storage.setItem(storageKey, JSON.stringify(data))
  }

  let currentFromStorage: LocalSessionSelections | undefined

  const getCurrent = (): LocalSessionSelections => {
    if (!currentFromStorage) {
      currentFromStorage = getFromStorage() ?? makeLocalSessionSelections()
    }
    return currentFromStorage
  }

  const setCurrent = (lsels: LocalSessionSelections) => {
    currentFromStorage = lsels
  }

  const notify = () => {
    observers.forEach((o) => o())
  }

  return {
    get: () => {
      return getCurrent()
    },
    add: (...items) => {
      let cur = getCurrent()
      cur = cur.add(...items)
      setCurrent(cur)
      saveToStorage(cur)
      notify()
      return cur
    },
    delete: (...items) => {
      let cur = getCurrent()
      cur = cur.delete(...items)
      setCurrent(cur)
      saveToStorage(cur)
      notify()
      return cur
    },
    save: (lsels) => {
      setCurrent(lsels)
      saveToStorage(lsels)
      notify()
      return lsels
    },
    handleEvent: (e) => {
      if (e.storageArea == storage && e.key == storageKey) {
        const newCur = getFromStorage()
        if (newCur) {
          setCurrent(newCur)
          notify()
        }
      }
    },
    subscribe: (cb) => {
      const unsub = () => {
        const idx = observers.findIndex((o) => o == cb)
        if (idx != -1) {
          observers.splice(idx, 1)
        }
      }
      observers.push(cb)
      return unsub
    },
  }
}

const makeServerSelectionsAPI = (
  baseURL: string,
  scheduleId: string,
  getSessionToken: () => Promise<string>,
): ServerSelectionsAPI => {
  const baseWretch = wretch(baseURL).url(`/schedules/${scheduleId}`)

  return {
    getSessionToken: () => getSessionToken(),
    getSelections: async (selectionsId) => {
      const res = await baseWretch
        .url(`/selections/${selectionsId}`)
        .get()
        .notFound(() => null)
        .json<SelectionsResponse | null>()

      if (res == null) {
        return null
      }

      return parseServerSelections(res.selections)
    },
    getCounts: async (type) => {
      const resp = await baseWretch
        .url(`/counts/${type}`)
        .get()
        .json<BookmarkCountsResponse>()
      return new Map(Object.entries(resp.counts))
    },
  }
}

const makeServerSessionSelectionsAPI = (
  type: SelectionsType,
  baseURL: string,
  scheduleId: string,
  getSessionToken: () => Promise<string>,
): ServerSessionSelectionsAPI => {
  const baseWretch = wretch(baseURL).url(`/schedules/${scheduleId}`)

  return {
    get: async () => {
      const sessionToken = await getSessionToken()
      const res = await baseWretch
        .url(`/session-selections/${type}`)
        .auth(`Bearer ${sessionToken}`)
        .get()
        .json<SessionSelectionsResponse>()
      return parseServerSessionSelections(res.session_selections)
    },
    update: async (opts) => {
      const sessionToken = await getSessionToken()
      const body: UpdateSelectionsRequest = {
        ...(opts?.selections
          ? { selections: { items: [...opts.selections] } }
          : null),
        add: [...(opts?.add ?? [])],
        remove: [...(opts?.delete ?? [])],
      }

      const res = await baseWretch
        .url(`/session-selections/${type}`)
        .auth(`Bearer ${sessionToken}`)
        .json(body)
        .put()
        .json<SessionSelectionsResponse>()

      return parseServerSessionSelections(res.session_selections)
    },
  }
}

/**
 * Make a {@link ServerSelectionsAPI} and a factory for {@link ServerSessionSelectionsAPI}.
 */
export const makeServerAPI = (
  baseURL: string,
  scheduleId: string,
  sessionToken?: string | null,
  opts?: {
    storage?: Storage
  },
): [
  ServerSelectionsAPI,
  (type: SelectionsType) => ServerSessionSelectionsAPI,
] => {
  const storage = opts?.storage ?? window.localStorage
  const baseWretch = wretch(baseURL).url(`/schedules/${scheduleId}`)
  const localStorageKey = `${SESSION_LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`

  const loadSessId = storage.getItem(localStorageKey)
  const setupSessId = sessionToken || loadSessId
  let curSessIdPromise: Promise<string> | null = null

  const setupSession = async () => {
    let req = baseWretch.url("/setup-session")
    if (setupSessId) {
      req = req.json({ session_id: setupSessId })
    }

    const res = await req.post().json<BookmarkSetupBody>()
    storage.setItem(localStorageKey, res.session_id)
    return res.session_id
  }

  const getSessionToken = () => {
    if (!curSessIdPromise) {
      curSessIdPromise = setupSession().catch((e) => {
        curSessIdPromise = null
        throw e
      })
    }
    return curSessIdPromise
  }

  return [
    makeServerSelectionsAPI(baseURL, scheduleId, getSessionToken),
    (type) =>
      makeServerSessionSelectionsAPI(
        type,
        baseURL,
        scheduleId,
        getSessionToken,
      ),
  ]
}

/**
 * Return a {@link SessionSelectionsAPI} that updates both the local and remote
 * selections.
 */
export const makeSyncedSelectionsAPI = (
  local: LocalSessionSelectionsStore,
  remote?: ServerSessionSelectionsAPI | null,
): SessionSelectionsAPI => {
  let syncPromise: Promise<LocalSessionSelections> | null = null
  let lastError: Date | undefined

  const getIsOnline = () => {
    if (
      lastError != null &&
      new Date().getTime() - lastError.getTime() < 60000
    ) {
      return false
    }
    return window.navigator.onLine !== false
  }

  const doInitialSync = async () => {
    let first = false
    try {
      if (remote && !syncPromise) {
        syncPromise = syncSessionSelections(local, remote)
        first = true
      }
      await syncPromise
    } catch (e) {
      if (first) {
        console.warn(`initial selections sync failed: ${e}`)
      }
      lastError = new Date()
    }
  }

  return {
    get: async () => {
      if (remote && getIsOnline()) {
        await doInitialSync()
      }
      return local.get()
    },
    add: async (...itemIds: string[]) => {
      const loc = local.add(...itemIds)
      await doInitialSync()

      if (remote && getIsOnline()) {
        try {
          const res = await remote.update({
            add: loc.added,
            delete: loc.deleted,
          })
          const newLoc = makeLocalSessionSelections(res, {
            base: res,
            date: res.date,
          })
          local.save(newLoc)
          return newLoc
        } catch (e) {
          console.warn(`sync failed: ${e}`)
          lastError = new Date()
          return loc
        }
      } else {
        return loc
      }
    },
    delete: async (...itemIds) => {
      const loc = local.delete(...itemIds)
      await doInitialSync()

      if (remote && getIsOnline()) {
        try {
          const res = await remote.update({
            add: loc.added,
            delete: loc.deleted,
          })
          const newLoc = makeLocalSessionSelections(res, {
            base: res,
            date: res.date,
          })
          local.save(newLoc)
          return newLoc
        } catch (e) {
          console.warn(`sync failed: ${e}`)
          lastError = new Date()
          return loc
        }
      } else {
        return loc
      }
    },
    save: async (itemIds) => {
      const loc = makeLocalSessionSelections(itemIds, { date: new Date() })
      local.save(loc)
      await doInitialSync()

      if (remote && getIsOnline()) {
        try {
          const res = await remote.update({ selections: itemIds })
          const resLoc = makeLocalSessionSelections(res, {
            base: res,
            date: res.date,
          })
          local.save(resLoc)
          return resLoc
        } catch (e) {
          console.warn(`sync failed: ${e}`)

          lastError = new Date()
          return loc
        }
      } else {
        return loc
      }
    },
  }
}

/**
 * Sync remote and local selections.
 */
export const syncSessionSelections = async (
  local: LocalSessionSelectionsStore,
  remote: ServerSessionSelectionsAPI,
): Promise<LocalSessionSelections> => {
  const curLocal = local.get()
  const curRemote = await remote.get()

  if (!curLocal.equals(curRemote)) {
    const updated = await remote.update({
      add: curLocal.added,
      delete: curLocal.deleted,
    })
    const loc = makeLocalSessionSelections(updated, {
      base: updated,
      date: updated.date,
    })
    local.save(loc)
    return loc
  } else {
    return curLocal
  }
}
