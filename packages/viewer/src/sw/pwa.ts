import { createContext } from "react"
import { createStore, type StoreApi } from "zustand"

declare global {
  type InstallPromptResult = Readonly<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>

  interface BeforeInstallPromptEvent extends Event {
    userChoice: Promise<InstallPromptResult>
    prompt(): Promise<InstallPromptResult>
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export type PWAStatus =
  | "unavailable"
  | "available"
  | "prompted"
  | "install-finished"

export type PWAState = Readonly<{
  pwaMode: boolean
  prompt?: (() => Promise<InstallPromptResult>) | undefined
  getStatus: () => PWAStatus
}>

type PWAPrivate = Readonly<{
  beforeInstallEvent?: BeforeInstallPromptEvent | undefined
  prompted: boolean
  installFinished: boolean
}>

export const makePWAStore = () => {
  return createStore<PWAState & PWAPrivate>()((set, get) => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      console.debug("Captured install prompt event")
      set({
        beforeInstallEvent: e,
        prompted: false,
        prompt: async () => {
          if (get().prompted) {
            return e.userChoice
          }

          set({ prompted: true })

          return e.prompt().then((result) => {
            if (result.outcome == "dismissed") {
              set({
                beforeInstallEvent: undefined,
                prompted: false,
                prompt: undefined,
              })
            }
            return result
          })
        },
      })
    })

    window.addEventListener("appinstalled", () => {
      console.debug("App install finished")
      set({ installFinished: true })
    })

    return {
      pwaMode: isPWAMode(),
      prompted: false,
      installFinished: false,
      getStatus: () => {
        const { pwaMode, beforeInstallEvent, prompted, installFinished } = get()

        if (pwaMode) {
          return "unavailable"
        } else if (installFinished) {
          return "install-finished"
        } else if (prompted) {
          return "prompted"
        } else if (beforeInstallEvent) {
          return "available"
        } else {
          return "unavailable"
        }
      },
    }
  })
}

const isPWAMode = (): boolean => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  )
}

export const PWAStoreContext = createContext<StoreApi<PWAState> | undefined>(
  undefined,
)
