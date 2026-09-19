import {
  createOptionalContext,
  makeRequiredContextProvider,
  useRequiredContext,
} from "@open-event-systems/schedule-react"
import { useCallback, useSyncExternalStore } from "react"
import type { Workbox } from "workbox-window"

export const SWStatus = {
  notInstalled: "not-installed",
  installing: "installing",
  ready: "ready",
  waiting: "waiting",
} as const

export type SWStatus = (typeof SWStatus)[keyof typeof SWStatus]

export type SWState = Readonly<{
  supported: boolean
  get status(): SWStatus
  register: (baseURL: string) => Promise<ServiceWorkerRegistration | undefined>
  subscribe: (cb: () => void) => () => void
  update: () => void
}>

/**
 * Return whether the environment supports service workers.
 */
export const getSupportsSW = (): boolean => {
  return typeof window != "undefined" && "serviceWorker" in window.navigator
}

const SWStateContext = createOptionalContext<SWState>()
export const SWStateProvider = makeRequiredContextProvider(SWStateContext)

/**
 * Use the current {@link SWStatus} and a reload/update trigger function..
 */
export const useSWStatus = (): [SWStatus, () => void] => {
  const state = useRequiredContext(SWStateContext)
  const get = useCallback(() => state.status, [state])
  return [
    useSyncExternalStore(state.subscribe, get, serverGetStatus),
    state.update,
  ]
}

const serverGetStatus = () => SWStatus.notInstalled

const RELOAD_KEY = "__ULE_SW_RELOAD"

/**
 * Create a {@link SWState} object.
 */
export const makeSWState = (): SWState => {
  const supported = getSupportsSW()
  let curStatus: SWStatus = SWStatus.notInstalled
  let curWB: Workbox | undefined

  const observers = new Set<() => void>()
  const notify = () => observers.forEach((o) => o())

  const baseObj = {
    get status() {
      return curStatus
    },
    supported,
    subscribe: (cb: () => void) => {
      observers.add(cb)
      return () => observers.delete(cb)
    },
    register: async (basePath: string) => {
      if (!supported || curStatus != SWStatus.notInstalled) {
        return undefined
      }

      const { Workbox } = await import("workbox-window")

      const swFile = import.meta.env.PROD ? "sw.js" : "dev-sw.js?dev-sw"

      const swURL = `${basePath}${swFile}`
      const wb = new Workbox(swURL)
      curWB = wb

      curStatus = SWStatus.installing
      notify()

      wb.addEventListener("installed", (e) => {
        if (!e.isUpdate) {
          // initial install
          // TODO: cache additional assets
        }
      })

      wb.addEventListener("activated", () => {
        curStatus = SWStatus.ready
        notify()
      })

      wb.addEventListener("waiting", () => {
        curStatus = SWStatus.waiting
        notify()
      })

      console.info("Service worker registering")

      try {
        const reg = await wb.register()
        if (reg?.active && curStatus == SWStatus.installing) {
          curStatus = SWStatus.ready
          notify()
        }
        return reg
      } catch (e) {
        console.error("Service worker registration failed", e)
        curStatus = SWStatus.notInstalled
        notify()
        return undefined
      }
    },
    update: () => {
      curWB?.messageSkipWaiting()
      window.localStorage.setItem(RELOAD_KEY, String(new Date().getTime()))
      window.localStorage.removeItem(RELOAD_KEY)
      window.location.reload()
    },
  }

  return baseObj
}

/**
 * Register a handler to reload the page on SW update.
 */
export const registerReloadHandler = (): (() => void) => {
  const handler = (e: StorageEvent) => {
    if (
      e.storageArea == window.localStorage &&
      e.key == RELOAD_KEY &&
      e.newValue
    ) {
      window.location.reload()
    }
  }

  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}
