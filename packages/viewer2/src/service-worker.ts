import { atom, getDefaultStore } from "jotai"
import type { Store } from "jotai/vanilla/store"
import { createContext } from "react"
import type { Workbox } from "workbox-window"

const DEFAULT_CACHE_URLS = ["config.js", "config.json", "custom.css"] as const

const LOCAL_STORAGE_KEY = "__oes-schedule-viewer-sw-reload__"

interface BeforeInstallPromptEvent extends Event {
  userChoice: Promise<Readonly<{ outcome: "accepted"; platform: string }>>
  prompt(): Promise<Readonly<{ outcome: "accepted"; platform: string }>>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export class SWStore {
  private workbox: Workbox | null = null
  beforeInstallPromptEventAtom = atom<BeforeInstallPromptEvent>()

  private resolveFirstInstall = () => {}
  updateAvailableAtom = atom(false)

  firstInstall = new Promise<void>((r) => (this.resolveFirstInstall = r))

  constructor(private store: Store) {}

  get beforeInstallPromptEvent(): BeforeInstallPromptEvent | undefined {
    return this.store.get(this.beforeInstallPromptEventAtom)
  }

  get updateAvailable(): boolean {
    return this.store.get(this.updateAvailableAtom)
  }

  async register(basePath = "", cacheURLs?: Iterable<string>) {
    try {
      const swPath = `${basePath}/sw.js`
      const { Workbox } = await import("workbox-window")
      this.workbox = new Workbox(swPath)

      this.workbox.addEventListener("installed", (e) => {
        if (!e.isUpdate) {
          console.info("Initial service worker installed")
          this.cacheURLs(cacheURLs)
        }
      })

      this.workbox.addEventListener("controlling", (e) => {
        if (!e.isUpdate) {
          this.resolveFirstInstall()
        }
      })

      this.workbox.addEventListener("waiting", () => {
        console.info("Service worker update available")
        this.store.set(this.updateAvailableAtom, true)
      })

      // for windows to reload when a new SW activates
      window.addEventListener("storage", (e) => {
        if (e.key == LOCAL_STORAGE_KEY && e.newValue != null) {
          window.location.reload()
        }
      })

      await this.workbox.register()

      console.info("Service worker registered")
    } catch (err) {
      console.error(`Service worker registration failed: ${err}`)
    }
  }

  async unregister() {
    const regs = await window.navigator.serviceWorker.getRegistrations()
    const res = await Promise.resolve(regs.map((r) => r.unregister()))
    if (res.some((res) => !!res)) {
      console.info("Unregistering service workers")
      this.notifyReload()
      window.location.reload()
    }
  }

  applyUpdate() {
    const wb = this.workbox
    if (wb) {
      const reload = () => {
        wb.removeEventListener("controlling", reload)
        this.notifyReload()
        window.location.reload()
      }
      wb.addEventListener("controlling", reload)
      wb.messageSkipWaiting()
    }
  }

  private notifyReload() {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, new Date().toISOString())
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
  }

  private cacheURLs(urls?: Iterable<string>) {
    // https://developer.chrome.com/docs/workbox/modules/workbox-window#send_the_service_worker_a_list_of_urls_to_cache
    this.workbox?.messageSW({
      type: "CACHE_URLS",
      payload: {
        urlsToCache: [...DEFAULT_CACHE_URLS, ...(urls ?? [])],
      },
    })
  }
}

export const SWStoreContext = createContext<SWStore>(
  new SWStore(getDefaultStore()),
)
