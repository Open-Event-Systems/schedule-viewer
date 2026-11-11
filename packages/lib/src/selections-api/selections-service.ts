/**
 * Remote selections implementations.
 * @module
 */

import { isTrackedSelections, makeServerSelections } from "#src/selections.js"
import type { SelectionsService } from "#src/types.js"
import wretch, { type ConfiguredMiddleware, type FetchLike, type Wretch } from "wretch"
import z from "zod"

const SESSION_LOCAL_STORAGE_KEY_PREFIX = "ule-selections-session-v3-"

type Envelope<T> = {
  data: T
}

// type BookmarkCountsResponse = {
//   counts: Record<string, number>
// }

type SelectionsResponseData = {
  id: string
  items: string[]
}

type UpdateSelectionsRequestData = {
  selections?: {
    items: string[]
  }
  add?: string[]
  remove?: string[]
}

type SessionInfo = {
  id: string
  secret: string
}

type SelectionsServiceSetupRequestData = Partial<SessionInfo>

type SelectionsServiceSetupResponseData = SessionInfo & {
  token: string
}

type SessionData = Readonly<{
  id: string
  secret: string
  token?: string | null
}>

export const makeSelectionsServiceAPI = (
  baseURL: URL,
  scheduleId: string,
  opts?: {
    id?: string | null
    secret?: string | null
    storage?: Storage | null
  },
): SelectionsService => {
  const storage = opts?.storage ?? window.localStorage

  const escScheduleId = encodeURIComponent(scheduleId)

  const baseWretch = wretch(String(baseURL)).url(`/schedules/${escScheduleId}`)

  const storageKey = makeStorageKey(scheduleId)

  const loadSession = () => {
    const val = storage.getItem(storageKey)
    if (!val) {
      return
    }

    let loaded

    try {
      loaded = JSON.parse(val)
      return sessionSchema.parse(loaded)
      // oxlint-disable-next-line no-unused-vars
    } catch (_e) {
      return
    }
  }

  const saveSession = (sessionData?: SessionData | null) => {
    if (sessionData) {
      storage.setItem(storageKey, JSON.stringify(sessionData))
    } else {
      storage.removeItem(storageKey)
    }
  }

  let sessionData: SessionData | null
  const observers = new Set<() => void>()

  if (opts?.id && opts.secret) {
    sessionData = {
      id: opts.id,
      secret: opts.secret,
    }
  } else {
    sessionData = loadSession() ?? null
  }

  const authHandler = makeAuthHandler(
    baseWretch,
    () => sessionData,
    (update) => {
      const prevToken = sessionData?.token
      sessionData = update(sessionData)

      saveSession(sessionData)

      if (sessionData?.token != prevToken) {
        observers.forEach((o) => o())
      }
    },
  )

  const authWretch = baseWretch.middlewares([authHandler.middleware])

  return {
    getSessionToken: () => sessionData?.token ?? null,
    subscribe: (cb) => {
      observers.add(cb)
      return () => observers.delete(cb)
    },
    getById: async (id) => {
      const res = await baseWretch
        .url(`/selections/${encodeURIComponent(id)}`)
        .get()
        .notFound(() => null)
        .json<Envelope<SelectionsResponseData>>()

      if (res == null) {
        return null
      }

      return makeServerSelections(res.data.id, res.data.items)
    },
    load: async (type) => {
      const sessionId = (await authHandler.getSessionData()).id
      const res = await authWretch
        .url(`/session-selections/${sessionId}/${type}`)
        .get()
        .json<Envelope<SelectionsResponseData>>()

      return makeServerSelections(res.data.id, res.data.items)
    },
    save: async (type, selections) => {
      const sessionId = (await authHandler.getSessionData()).id

      let body

      if (isTrackedSelections(selections)) {
        body = {
          data: {
            add: [...selections.added],
            remove: [...selections.removed],
          },
        } satisfies Envelope<UpdateSelectionsRequestData>
      } else {
        body = {
          data: {
            selections: {
              items: [...selections],
            },
          },
        } satisfies Envelope<UpdateSelectionsRequestData>
      }

      const res = await authWretch
        .url(`/session-selections/${sessionId}/${type}`)
        .json(body)
        .put()
        .json<Envelope<SelectionsResponseData>>()

      return makeServerSelections(res.data.id, res.data.items)
    },
    getCounts: async () => new Map(), // TODO
  }
}

const sessionSchema = z.object({
  id: z.string(),
  secret: z.string(),
  token: z.string().nullable().exactOptional(),
})

const makeStorageKey = <T extends string>(scheduleId: T) =>
  `${SESSION_LOCAL_STORAGE_KEY_PREFIX}${scheduleId}` as const

const makeAuthHandler = (
  baseWretch: Wretch,
  getData: () => SessionData | null | undefined,
  setData: (update: (prev: SessionData | null) => SessionData | null) => void,
) => {
  let setupPromise: Promise<SessionData & { readonly token: string }> | null = null

  {
    const initialData = getData()
    if (initialData?.token) {
      setupPromise = Promise.resolve({
        ...initialData,
        token: initialData.token,
      })
    }
  }

  const doSetup = async () => {
    const data = getData()

    const body: Envelope<SelectionsServiceSetupRequestData> = { data: {} }

    if (data?.id) {
      body.data.id = data.id
      body.data.secret = data.secret
    }

    const res = await baseWretch
      .url("/setup-session")
      .json(body)
      .post()
      .json<Envelope<SelectionsServiceSetupResponseData>>()

    return res.data
  }

  const awaitSetup = async () => {
    if (!setupPromise) {
      const newPromise = doSetup()
        .then((res) => {
          setData(() => res)
          return res
        })
        .catch((err) => {
          setupPromise = null
          throw err
        })

      setupPromise = newPromise
    }

    return await setupPromise
  }

  const clearData = (token?: string | null) => {
    const curData = getData()
    if (curData?.token == token) {
      setData(() => null)
      setupPromise = null
    }
  }

  return {
    getSessionData: async () => await awaitSetup(),
    middleware: (next: FetchLike): FetchLike => {
      return async (url, opts) => {
        let curToken = (await awaitSetup()).token

        const res = await makeTokenMiddleware(curToken)(next)(url, opts)
        if (res.status == 401) {
          clearData(curToken)
          curToken = (await awaitSetup()).token
          return await makeTokenMiddleware(curToken)(next)(url, opts)
        } else {
          return res
        }
      }
    },
  }
}

const makeTokenMiddleware = (token: string): ConfiguredMiddleware => {
  return (next) => {
    return async (url, opts) => {
      const newHeaders = new Headers(opts.headers)
      newHeaders.set("Authorization", `Bearer ${token}`)

      const newOpts = {
        ...opts,
        headers: newHeaders,
      }

      return await next(url, newOpts)
    }
  }
}
