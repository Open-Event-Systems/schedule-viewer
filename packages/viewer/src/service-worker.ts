import { action, makeAutoObservable, runInAction } from "mobx"
import { createContext, useContext } from "react"
import { Workbox } from "workbox-window"

export class SWStore {
  public updateAvailable = false
  private workbox: Workbox | null = null

  constructor() {
    makeAutoObservable<this, "workbox">(this, {
      workbox: false,
    })
  }

  register(basePath = "") {
    if ("serviceWorker" in navigator) {
      import("workbox-window").then(({ Workbox }) => {
        const workbox = new Workbox(`${basePath}sw.js`)

        workbox.addEventListener(
          "waiting",
          action(() => {
            console.info("New service worker available")
            this.updateAvailable = true
            workbox.addEventListener("controlling", () => {
              window.location.reload()
            })
          }),
        )

        workbox.addEventListener("activated", () => {
          console.info("Caching runtime config files")
          // cache the config files on activation
          workbox.messageSW({
            type: "CACHE_URLS",
            payload: {
              urlsToCache: ["theme.js", "custom.css", "config.json"],
            },
          })
        })

        workbox
          .register()
          .then((reg) => {
            console.info("Service worker registered")
          })
          .catch((err) => {
            console.error(`Service worker registration failed: ${err}`)
          })
        runInAction(() => {
          this.workbox = workbox
        })
      })
    }
  }

  confirmUpdate() {
    if (this.workbox) {
      this.workbox.messageSkipWaiting()
    }
  }
}

export const SWStoreContext = createContext<SWStore>(new SWStore())
export const useSWStore = (): SWStore => useContext(SWStoreContext)
