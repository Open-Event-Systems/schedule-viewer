import wretch, { type FetchLike, type Wretch } from "wretch"
import type {
  Selections,
  SelectionsService,
  SelectionsStore,
  SelectionsType,
} from "./types.js"
import {
  isServerSelections,
  isTrackedSelections,
  makeSelections,
  makeTrackedSelections,
  parseSelections,
  unparseSelections,
} from "./selections.js"

const SELECTIONS_LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-selections-v3-"
const SESSION_LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-selections-session-v3-"

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
export const makeMemoryLocalSelectionsStore = (): SelectionsStore => {
  const byType = new Map<SelectionsType, Selections>()

  return {
    load: async (type) => {
      let cur = byType.get(type)
      if (cur == null) {
        cur = makeTrackedSelections(makeSelections())
        byType.set(type, cur)
      }

      return cur
    },
    save: async (type, selections) => {
      byType.set(type, selections)
      return selections
    },
  }
}

export type LocalStorageSelectionsStore = SelectionsStore &
  Readonly<{
    handleStorageEvent: (
      type: SelectionsType,
      e: StorageEvent,
    ) => Selections | null | false
  }>

export const makeLocalStorageSessionSelectionsStore = (
  scheduleId: string,
  storage?: Storage,
): LocalStorageSelectionsStore => {
  storage = storage ?? window.localStorage
  const getStorageKey = (type: SelectionsType) =>
    `${SELECTIONS_LOCAL_STORAGE_KEY_PREFIX}${type}-${scheduleId}`

  const getFromStorage = (type: SelectionsType): Selections | null => {
    let errObj
    try {
      const dataStr = storage.getItem(getStorageKey(type))
      if (!dataStr) {
        return null
      }

      const data = JSON.parse(dataStr)
      const res = parseSelections(data)
      if (res.success) {
        return res.data
      } else {
        errObj = res.message
      }
    } catch (e) {
      errObj = e
    }

    console.warn(`failed to load selections from storage: ${errObj}`)
    return null
  }

  const saveToStorage = (type: SelectionsType, selections: Selections) => {
    const data = unparseSelections(selections)
    storage.setItem(getStorageKey(type), JSON.stringify(data))
  }

  const currentFromStorage = new Map<SelectionsType, Selections>()

  const getCurrent = (type: SelectionsType): Selections => {
    let cur = currentFromStorage.get(type)
    if (cur == null) {
      cur = getFromStorage(type) ?? makeTrackedSelections(makeSelections())
      currentFromStorage.set(type, cur)
    }
    return cur
  }

  const setCurrent = (type: SelectionsType, selections: Selections) => {
    currentFromStorage.set(type, selections)
  }

  return {
    load: async (type) => {
      return getCurrent(type)
    },
    save: async (type, selections) => {
      setCurrent(type, selections)
      saveToStorage(type, selections)
      return selections
    },
    handleStorageEvent: (type, e) => {
      const storageKey = getStorageKey(type)
      if (e.storageArea == storage && e.key == storageKey) {
        const newCur = getFromStorage(type)
        if (newCur) {
          setCurrent(type, newCur)
        }
        return newCur
      } else {
        return false
      }
    },
  }
}

export const makeRemoteSelectionsService = (
  baseURL: string,
  scheduleId: string,
  sessionToken?: string | null,
  opts?: {
    storage?: Storage
  },
): SelectionsService => {
  const storage = opts?.storage ?? window.localStorage
  const localStorageKey = `${SESSION_LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`
  const loadedSessId = storage.getItem(localStorageKey)
  const setupSessId = sessionToken || loadedSessId

  const baseWretch = wretch(baseURL).url(`/schedules/${scheduleId}`)

  const observers = new Set<() => void>()

  const getSessionToken = () => api.sessionToken
  const setSessionToken = (token: string | null) => {
    api.sessionToken = token
    for (const observer of observers) {
      observer()
    }
  }

  const authWretch = baseWretch.middlewares([
    makeSessionSetupMiddleware(
      baseWretch,
      getSessionToken,
      setSessionToken,
      setupSessId,
    ),
  ])

  const api: {
    -readonly [K in keyof SelectionsService]: SelectionsService[K]
  } & { handleStorageEvent: (e: StorageEvent) => void } = {
    sessionToken: null,
    getById: async (id) => {
      const res = await baseWretch
        .url(`/selections/${id}`)
        .get()
        .notFound(() => null)
        .json<SelectionsResponse | null>()
      const parsed = parseSelections(res?.selections)
      if (parsed.success) {
        if (isServerSelections(parsed.data)) {
          return parsed.data
        } else {
          throw new Error(`Not a ServerSelections: ${parsed.data}`)
        }
      } else {
        throw parsed.error
      }
    },
    getCounts: async (type) => {
      const resp = await baseWretch
        .url(`/counts/${type}`)
        .get()
        .json<BookmarkCountsResponse>()
      return new Map(Object.entries(resp.counts))
    },
    load: async (type) => {
      const res = await authWretch
        .url(`/session-selections/${type}`)
        .get()
        .json<SessionSelectionsResponse>()
      const parsed = parseSelections(res.session_selections.selections)
      if (parsed.success) {
        if (isServerSelections(parsed.data)) {
          return parsed.data
        } else {
          throw new Error(`Not a ServerSelections: ${parsed.data}`)
        }
      } else {
        throw parsed.error
      }
    },
    save: async (type, selections) => {
      let body: UpdateSelectionsRequest
      if (isTrackedSelections(selections)) {
        body = {
          add: [...selections.added],
          remove: [...selections.deleted],
        }
      } else {
        body = {
          selections: {
            items: [...selections],
          },
        }
      }

      const res = await authWretch
        .url(`/session-selections/${type}`)
        .json(body)
        .put()
        .json<SessionSelectionsResponse>()

      const parsed = parseSelections(res.session_selections.selections)
      if (parsed.success) {
        if (isServerSelections(parsed.data)) {
          return parsed.data
        } else {
          throw new Error(`Not a ServerSelections: ${parsed.data}`)
        }
      } else {
        throw parsed.error
      }
    },
    handleStorageEvent: (e) => {
      if (e.storageArea == storage && e.key == localStorageKey) {
        setSessionToken(e.newValue)
      }
    },
    subscribe: (callback) => {
      observers.add(callback)

      return () => {
        observers.delete(callback)
      }
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
 * Return a {@link SelectionsStore} that updates both the local and remote
 * selections.
 */
export const makeSyncedSelectionsStore = (
  local: SelectionsStore,
  remote?: SelectionsService | null,
): SelectionsStore => {
  const syncPromises = new Map<SelectionsType, Promise<Selections>>()
  let lastError: number | null = null

  const getHasError = () => {
    return lastError != null && new Date().getTime() - lastError < 60000
  }

  const doInitialSync = async (type: SelectionsType) => {
    if (!remote || getHasError() || !getIsOnline()) {
      return
    }

    let syncPromise = syncPromises.get(type)

    if (!syncPromise) {
      syncPromise = syncSessionSelections(type, local, remote).catch((e) => {
        console.warn(`initial ${type} selections sync failed: ${e}`)
        syncPromises.delete(type)
        lastError = new Date().getTime()
        throw e
      })
      syncPromises.set(type, syncPromise)
    }

    await syncPromise.catch(() => {})
  }

  return {
    load: async (type) => {
      await doInitialSync(type)
      return await local.load(type)
    },
    save: async (type, selections) => {
      await doInitialSync(type)
      const updatedLocal = await local.save(type, selections)

      if (remote && getIsOnline() && !getHasError()) {
        try {
          const updatedRemote = await remote.save(type, updatedLocal)
          const finalLocal = await local.save(type, updatedRemote)
          return finalLocal
        } catch (e) {
          console.warn(`sync failed: ${e}`)
          lastError = new Date().getTime()
          return updatedLocal
        }
      } else {
        return updatedLocal
      }
    },
  }
}

/**
 * Sync remote and local selections.
 */
export const syncSessionSelections = async (
  type: SelectionsType,
  local: SelectionsStore,
  remote: SelectionsService,
): Promise<Selections> => {
  const [curLocal, curRemote] = await Promise.all([
    local.load(type),
    remote.load(type),
  ])

  if (!curLocal.equals(curRemote)) {
    const updatedRemote = await remote.save(type, curLocal)
    const finalLocal = await local.save(type, updatedRemote)
    return finalLocal
  } else {
    return curLocal
  }
}
