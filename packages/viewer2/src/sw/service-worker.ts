import { createContext } from "react"
import type { Workbox } from "workbox-window"
import { createStore, type StoreApi } from "zustand"

const DEFAULT_CACHE_URLS = ["config.js", "config.json", "custom.css"] as const

const LOCAL_STORAGE_KEY = "__oes-schedule-viewer-sw-reload__"

type InstallPromptResult = Readonly<{
  outcome: "accepted" | "dismissed"
  platform: string
}>

interface BeforeInstallPromptEvent extends Event {
  userChoice: Promise<InstallPromptResult>
  prompt(): Promise<InstallPromptResult>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export type SWStore = Readonly<{
  beforeInstallPromptEvent?: BeforeInstallPromptEvent | undefined
  registering: boolean
  swReady: boolean
  updateAvailable: boolean
  installPrompted: boolean
  firstInstallPromise: Promise<void>
  register: (basePath?: string, cacheURLs?: Iterable<string>) => Promise<void>
  unregister: () => Promise<void>
  update: () => void
  promptInstall?: () => Promise<InstallPromptResult> | undefined
}>

type SWStorePrivate = Readonly<{
  workbox?: Workbox | undefined
  resolveFirstInstall: () => void
}>

export const makeSWStore = (): StoreApi<SWStore> => {
  let resolveFirstInstall = () => {}
  const firstInstallPromise = new Promise<void>(
    (r) => (resolveFirstInstall = r),
  )

  return createStore<SWStore & SWStorePrivate>()((set, get) => ({
    registering: false,
    swReady: !!navigator.serviceWorker.controller,
    updateAvailable: false,
    installPrompted: false,
    firstInstallPromise,
    resolveFirstInstall,
    register: async (basePath = "", urlsToCache) => {
      set({ registering: true })
      try {
        const swPath = `${basePath}/sw.js`
        const { Workbox } = await import("workbox-window")
        const workbox = new Workbox(swPath)

        workbox.addEventListener("installed", (e) => {
          if (!e.isUpdate) {
            console.info("Initial service worker installed")
            cacheURLs(workbox, urlsToCache).then(() => {
              set({ swReady: true })
            })
          }
        })

        workbox.addEventListener("controlling", (e) => {
          if (!e.isUpdate) {
            get().resolveFirstInstall()
          }
        })

        workbox.addEventListener("waiting", () => {
          console.info("Service worker update available")
          set({ updateAvailable: true })
        })

        // install prompts
        window.addEventListener("beforeinstallprompt", (e) => {
          e.preventDefault()
          console.info("Install prompt captured")

          const promptFunc = async () => {
            set({ installPrompted: true })
            return await e.prompt()
          }

          set({
            beforeInstallPromptEvent: e,
            installPrompted: false,
            promptInstall: promptFunc,
          })
        })

        // for windows to reload when a new SW activates
        window.addEventListener("storage", (e) => {
          if (e.key == LOCAL_STORAGE_KEY && e.newValue != null) {
            console.info(
              "Reloading due to service worker update from another window",
            )
            window.location.reload()
          }
        })

        await workbox.register()
        console.info("Service worker registered")
        set({ workbox, registering: false })
      } catch (err) {
        console.error(`Service worker registration failed: ${err}`)
        set({ registering: false })
      }
    },
    unregister: async () => {
      const regs = await window.navigator.serviceWorker.getRegistrations()
      const res = await Promise.resolve(regs.map((r) => r.unregister()))
      if (res.some((res) => !!res)) {
        console.info("Unregistering service workers")
        notifyReload()
        window.location.reload()
      }
    },
    update: () => {
      const wb = get().workbox
      if (wb) {
        const reload = () => {
          wb.removeEventListener("controlling", reload)
          notifyReload()
          window.location.reload()
        }
        wb.addEventListener("controlling", reload)
        wb.messageSkipWaiting()
      }
    },
  }))
}

const cacheURLs = async (workbox: Workbox, urls?: Iterable<string>) => {
  // https://developer.chrome.com/docs/workbox/modules/workbox-window#send_the_service_worker_a_list_of_urls_to_cache
  await workbox.messageSW({
    type: "CACHE_URLS",
    payload: {
      urlsToCache: [...DEFAULT_CACHE_URLS, ...(urls ?? [])],
    },
  })
}

const notifyReload = () => {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, new Date().toISOString())
  window.localStorage.removeItem(LOCAL_STORAGE_KEY)
}

export const SWStoreContext = createContext<StoreApi<SWStore> | undefined>(
  undefined,
)
