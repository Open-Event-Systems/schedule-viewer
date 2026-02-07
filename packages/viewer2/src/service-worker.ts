import { action, makeObservable, observable, runInAction, when } from "mobx"
import { createContext } from "react"
import type { Workbox } from "workbox-window"

const DEFAULT_CACHE_URLS = ["config.js", "config.json", "custom.css"] as const

const LOCAL_STORAGE_KEY = "__oes-schedule-viewer-sw-reload__"

export class SWStore {
  public updateAvailable = false
  public firstReady: Promise<void>
  private _workbox: Workbox | null = null
  private _firstReady = false

  constructor() {
    makeObservable<this, "_firstReady">(this, {
      updateAvailable: observable,
      _firstReady: observable,
    })

    this.firstReady = when(() => this._firstReady)
  }

  async register(basePath = "", cacheURLs?: Iterable<string>) {
    try {
      const swPath = `${basePath}/sw.js`
      const { Workbox } = await import("workbox-window")
      const wb = new Workbox(swPath)

      runInAction(() => {
        this._workbox = wb
      })

      wb.addEventListener("installed", (e) => {
        if (!e.isUpdate) {
          console.info("Initial service worker installed")
          this.cacheURLs(cacheURLs)
        }
      })

      wb.addEventListener("controlling", (e) => {
        if (!e.isUpdate) {
          runInAction(() => {
            this._firstReady = true
          })
        }
      })

      wb.addEventListener(
        "waiting",
        action(() => {
          console.info("Service worker update available")
          this.updateAvailable = true
        }),
      )

      // for windows to reload when a new SW activates
      window.addEventListener("storage", (e) => {
        if (e.key == LOCAL_STORAGE_KEY && e.newValue != null) {
          window.location.reload()
        }
      })

      await wb.register()

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
    const wb = this._workbox
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
    this._workbox?.messageSW({
      type: "CACHE_URLS",
      payload: {
        urlsToCache: [...DEFAULT_CACHE_URLS, ...(urls ?? [])],
      },
    })
  }
}

export const SWStoreContext = createContext<SWStore>(new SWStore())
