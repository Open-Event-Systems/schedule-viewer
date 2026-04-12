import type {
  SelectionsType,
  LocalSessionSelections,
  LocalSessionSelectionsStore,
  SessionSelectionsAPI,
  SelectionsServiceAPI,
} from "./types.js"
import wretch, { type FetchLike, type Wretch } from "wretch"
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
    const observers = new Set<() => void>()

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
          observers.delete(cb)
        }
        observers.add(cb)
        return unsub
      },
    }
  }

export type LocalStorageSelectionsStore = LocalSessionSelectionsStore &
  Readonly<{
    handleStorageEvent: (
      e: StorageEvent,
    ) => LocalSessionSelections | null | false
  }>

export const makeLocalStorageSessionSelectionsStore = (
  type: SelectionsType,
  scheduleId: string,
  storage?: Storage,
): LocalStorageSelectionsStore => {
  storage = storage ?? window.localStorage
  const storageKey = `${SELECTIONS_LOCAL_STORAGE_KEY_PREFIX}${type}-${scheduleId}`
  const observers = new Set<() => void>()

  const getFromStorage = (): LocalSessionSelections | null => {
    try {
      const dataStr = storage.getItem(storageKey)
      if (!dataStr) {
        return null
      }

      const data = JSON.parse(dataStr)
      return parseLocalSessionSelections(data)
    } catch (e) {
      console.warn(`failed to load selections from storage: ${e}`)
      return null
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
    handleStorageEvent: (e) => {
      if (e.storageArea == storage && e.key == storageKey) {
        const newCur = getFromStorage()
        if (newCur) {
          setCurrent(newCur)
          notify()
        }
        return newCur
      } else {
        return false
      }
    },
    subscribe: (cb) => {
      const unsub = () => {
        observers.delete(cb)
      }
      observers.add(cb)
      return unsub
    },
  }
}

export const makeSelectionsServiceAPI = (
  baseURL: string,
  scheduleId: string,
  sessionToken?: string | null,
  opts?: {
    storage?: Storage
  },
): SelectionsServiceAPI & { handleStorageEvent: (e: StorageEvent) => void } => {
  const storage = opts?.storage ?? window.localStorage
  const localStorageKey = `${SESSION_LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`

  const loadSessId = storage.getItem(localStorageKey)
  const setupSessId = sessionToken || loadSessId

  const observers = new Set<() => void>()

  const notify = () => {
    observers.forEach((cb) => cb())
  }

  const updateToken = (s: string | null) => {
    if (s) {
      storage.setItem(localStorageKey, s)
    } else {
      storage.removeItem(localStorageKey)
    }
    api.sessionToken = s
    notify()
  }

  const baseWretch = wretch(baseURL).url(`/schedules/${scheduleId}`)

  const authWretch = baseWretch.middlewares([
    makeSessionSetupMiddleware(
      baseWretch,
      () => api.sessionToken,
      updateToken,
      setupSessId,
    ),
  ])

  const api: {
    -readonly [K in keyof SelectionsServiceAPI]: SelectionsServiceAPI[K]
  } & { handleStorageEvent: (e: StorageEvent) => void } = {
    sessionToken: null,
    subscribe: (cb) => {
      const unsub = () => {
        observers.delete(cb)
      }
      observers.add(cb)
      return unsub
    },
    handleStorageEvent: (e) => {
      if (e.storageArea == storage && e.key == localStorageKey) {
        api.sessionToken = e.newValue
        notify()
      }
    },
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
    getSessionSelections: async (type) => {
      const res = await authWretch
        .url(`/session-selections/${type}`)
        .get()
        .json<SessionSelectionsResponse>()
      return parseServerSessionSelections(res.session_selections)
    },
    updateSessionSelections: async (type, update) => {
      const body: UpdateSelectionsRequest = {
        ...(update?.selections
          ? { selections: { items: [...update.selections] } }
          : null),
        add: [...(update?.add ?? [])],
        remove: [...(update?.delete ?? [])],
      }

      const res = await authWretch
        .url(`/session-selections/${type}`)
        .json(body)
        .put()
        .json<SessionSelectionsResponse>()

      return parseServerSessionSelections(res.session_selections)
    },
  }

  return api
}

const makeSessionSetupMiddleware = (
  baseWretch: Wretch,
  get: () => string | null,
  set: (sessionToken: string | null) => void,
  initialSessionToken?: string | null,
) => {
  let setupPromise: Promise<string> | null = null

  const setup = async () => {
    let req = baseWretch.url("/setup-session")
    if (initialSessionToken) {
      req = req.json({ session_id: initialSessionToken })
    }

    const res = await req.post().json<BookmarkSetupBody>()
    set(res.session_id)
    return res.session_id
  }

  return (next: FetchLike): FetchLike => {
    return async (url, opts) => {
      let curToken = get()
      if (curToken == null) {
        if (setupPromise == null) {
          setupPromise = setup().catch((e) => {
            setupPromise = null
            throw e
          })
        }
        curToken = await setupPromise
      }

      const newHeaders = new Headers(opts.headers)
      newHeaders.set("Authorization", `Bearer ${curToken}`)
      const newOpts = { ...opts, headers: newHeaders }

      const resp = await next(url, newOpts)
      if (resp.status == 401) {
        const newCurToken = get()
        if (newCurToken == curToken) {
          set(null)
        }
      }

      return resp
    }
  }
}

const getIsOnline = () =>
  !("onLine" in window.navigator && window.navigator.onLine === false)

/**
 * Return a {@link SessionSelectionsAPI} that updates both the local and remote
 * selections.
 */
export const makeSyncedSelectionsAPI = (
  type: SelectionsType,
  local: LocalSessionSelectionsStore,
  remote?: SelectionsServiceAPI | null,
): SessionSelectionsAPI => {
  let syncPromise: Promise<LocalSessionSelections> | null = null
  let lastError: number | null = null

  const getHasError = () => {
    return lastError != null && new Date().getTime() - lastError < 60000
  }

  const doInitialSync = async () => {
    if (!remote || getHasError() || !getIsOnline()) {
      return
    }

    if (!syncPromise) {
      syncPromise = syncSessionSelections(type, local, remote).catch((e) => {
        console.warn(`initial ${type} selections sync failed: ${e}`)
        syncPromise = null
        lastError = new Date().getTime()
        throw e
      })
    }

    await syncPromise.catch(() => {})
  }

  const sync = async (loc: LocalSessionSelections) => {
    if (remote && getIsOnline() && !getHasError()) {
      try {
        const res = await remote.updateSessionSelections(type, {
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
        lastError = new Date().getTime()
        return loc
      }
    } else {
      return loc
    }
  }

  return {
    get: async () => {
      await doInitialSync()
      return local.get()
    },
    add: async (...itemIds: string[]) => {
      await doInitialSync()
      const loc = local.add(...itemIds)
      return await sync(loc)
    },
    delete: async (...itemIds) => {
      await doInitialSync()
      const loc = local.delete(...itemIds)
      return await sync(loc)
    },
    save: async (itemIds) => {
      await doInitialSync()
      const loc = makeLocalSessionSelections(itemIds, { date: new Date() })
      local.save(loc)
      return await sync(loc)
    },
  }
}

/**
 * Sync remote and local selections.
 */
export const syncSessionSelections = async (
  type: SelectionsType,
  local: LocalSessionSelectionsStore,
  remote: SelectionsServiceAPI,
): Promise<LocalSessionSelections> => {
  const curLocal = local.get()
  const curRemote = await remote.getSessionSelections(type)

  if (!curLocal.equals(curRemote)) {
    const updated = await remote.updateSessionSelections(type, {
      add: curLocal.added,
      delete: curLocal.deleted,
    })
    const newLocal = makeLocalSessionSelections(updated, {
      base: updated,
      date: updated.date,
    })
    local.save(newLocal)
    return newLocal
  } else {
    return curLocal
  }
}
