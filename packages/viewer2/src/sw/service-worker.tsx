import { createContext } from "react"
import type { Workbox } from "workbox-window"
import { createStore, type StoreApi } from "zustand"

const DEFAULT_CACHE_URLS = ["config.js", "config.json", "custom.css"] as const

const LOCAL_STORAGE_KEY = "__oes-schedule-viewer-sw-reload__"

export type SWStatus =
  | "unavailable"
  | "installing"
  | "ready"
  | "update-available"

export type SWState = Readonly<{
  firstInstallPromise: Promise<void>
  register: (basePath?: string, cacheURLs?: Iterable<string>) => Promise<void>
  unregister: () => Promise<void>
  update: () => void
  getStatus: () => SWStatus
}>

type SWStatePrivate = Readonly<{
  hasExistingSW: boolean
  registrationState: "not-started" | "registering" | "installed" | "error"
  isWaiting: boolean
  workbox?: Workbox | undefined
  initialPrecacheComplete?: boolean
  resolveFirstInstall: () => void
}>

export const makeSWStore = (): StoreApi<SWState> => {
  return createStore<SWState & SWStatePrivate>()((set, get) => {
    let resolveFirstInstall = () => {}
    const firstInstallPromise = new Promise<void>(
      (r) => (resolveFirstInstall = r),
    )

    return {
      hasExistingSW: hasCurrentSW(),
      registrationState: "not-started",
      isWaiting: false,
      resolveFirstInstall,
      status: "unavailable",
      firstInstallPromise,
      register: async (basePath = "", urlsToCache) => {
        if (get().registrationState != "not-started") {
          return
        }
        set({ registrationState: "registering" })
        console.debug("Registering service worker")

        try {
          const swPath = `${basePath}/sw.js`
          const { Workbox } = await import("workbox-window")
          const workbox = new Workbox(swPath)

          workbox.addEventListener("installed", (e) => {
            set({ registrationState: "installed" })
            if (!e.isUpdate) {
              // initial install, submit additional URLs to cache
              cacheURLs(workbox, urlsToCache)
                .catch(() => {
                  // ?
                })
                .then(() => {
                  set({ initialPrecacheComplete: true })
                })
            }
          })

          workbox.addEventListener("waiting", () => {
            console.info("Service worker update available")
            set({ isWaiting: true })
          })

          workbox.addEventListener("controlling", (e) => {
            if (!e.isUpdate) {
              // initial SW is now controlling the page
              get().resolveFirstInstall()
            }
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

          set({ workbox })
          await workbox.register()
        } catch (e) {
          console.warn(`Service worker registration failed: ${e}`)
          set({ registrationState: "error" })
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
      getStatus: () => {
        const {
          hasExistingSW,
          registrationState,
          isWaiting,
          initialPrecacheComplete,
        } = get()

        if (isWaiting) {
          return "update-available"
        } else if (
          hasExistingSW ||
          (registrationState == "installed" && initialPrecacheComplete)
        ) {
          return "ready"
        } else if (
          registrationState == "error" ||
          registrationState == "not-started"
        ) {
          return "unavailable"
        } else if (
          registrationState == "registering" ||
          !initialPrecacheComplete
        ) {
          return "installing"
        } else {
          return "unavailable"
        }
      },
    }
  })
}

const hasCurrentSW = (): boolean => {
  return !!navigator.serviceWorker.controller
}

// export const makeSWStore = (): StoreApi<SWStore> => {
//   let resolveFirstInstall = () => {}
//   const firstInstallPromise = new Promise<void>(
//     (r) => (resolveFirstInstall = r),
//   )

//   return createStore<SWStore & SWStorePrivate>()((set, get) => {
//     // install prompts
//     window.addEventListener("beforeinstallprompt", (e) => {
//       e.preventDefault()
//       console.info("Install prompt captured")

//       const promptFunc = async () => {
//         set({ installPrompted: true })
//         return await e.prompt()
//       }

//       set({
//         beforeInstallPromptEvent: e,
//         installPrompted: false,
//         promptInstall: promptFunc,
//       })
//     })

//     return {
//       registering: false,
//       swReady: !!navigator.serviceWorker.controller,
//       updateAvailable: false,
//       installPrompted: false,
//       firstInstallPromise,
//       resolveFirstInstall,
//       register: async (basePath = "", urlsToCache) => {
//         set({ registering: true })
//         try {
//           const swPath = `${basePath}/sw.js`
//           const { Workbox } = await import("workbox-window")
//           const workbox = new Workbox(swPath)

//           workbox.addEventListener("installed", (e) => {
//             if (!e.isUpdate) {
//               console.info("Initial service worker installed")
//               cacheURLs(workbox, urlsToCache)
//                 .then(() => {
//                   set({ swReady: true, registering: false })
//                 })
//                 .catch(() => {
//                   set({ registering: false })
//                 })
//             }
//           })

//           workbox.addEventListener("controlling", (e) => {
//             if (!e.isUpdate) {
//               get().resolveFirstInstall()
//             }
//           })

//           workbox.addEventListener("waiting", () => {
//             console.info("Service worker update available")
//             set({ updateAvailable: true, registering: false })
//             showUpdateNotification()
//           })

//           // for windows to reload when a new SW activates
//           window.addEventListener("storage", (e) => {
//             if (e.key == LOCAL_STORAGE_KEY && e.newValue != null) {
//               console.info(
//                 "Reloading due to service worker update from another window",
//               )
//               window.location.reload()
//             }
//           })

//           await workbox.register()
//           set({ workbox })
//           console.info("Service worker registered")
//         } catch (err) {
//           console.error(`Service worker registration failed: ${err}`)
//           set({ registering: false })
//         }
//       },
//       unregister: async () => {
//         const regs = await window.navigator.serviceWorker.getRegistrations()
//         const res = await Promise.resolve(regs.map((r) => r.unregister()))
//         if (res.some((res) => !!res)) {
//           console.info("Unregistering service workers")
//           notifyReload()
//           window.location.reload()
//         }
//       },
//       update: () => {
//         const wb = get().workbox
//         if (wb) {
//           const reload = () => {
//             wb.removeEventListener("controlling", reload)
//             notifyReload()
//             window.location.reload()
//           }
//           wb.addEventListener("controlling", reload)
//           wb.messageSkipWaiting()
//         }
//       },
//     }
//   })
// }

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

const showUpdateNotification = async () => {
  const [notifications, { updateNotificationProps, UpdateNotificationBody }] =
    await Promise.all([
      import("@mantine/notifications").then(
        ({ notifications }) => notifications,
      ),
      import("../components/sw/update-notification.js").then(
        ({ updateNotificationProps, UpdateNotificationBody }) => ({
          updateNotificationProps,
          UpdateNotificationBody,
        }),
      ),
    ])

  notifications.show({
    ...updateNotificationProps,
    message: <UpdateNotificationBody />,
  })
}

export const SWStoreContext = createContext<StoreApi<SWState> | undefined>(
  undefined,
)
