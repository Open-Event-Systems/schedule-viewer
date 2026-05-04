import { isPWAMode } from "./sw/pwa.js"

const LOCAL_STORAGE_KEY = "aosid"
const PREFIX = "aosid_"

export const setupUmami = () => {
  const storageHandler = (e: StorageEvent) => {
    if (
      e.storageArea == window.localStorage &&
      e.key == LOCAL_STORAGE_KEY &&
      e.newValue
    ) {
      identify(getUserId())
    }
  }

  window.addEventListener("storage", storageHandler)

  identify(getUserId())
}

export const getUserId = (): string => {
  const fromStorage = window.localStorage.getItem(LOCAL_STORAGE_KEY)
  if (typeof fromStorage == "string" && fromStorage.startsWith(PREFIX)) {
    return fromStorage
  }

  const newId = makeId()

  window.localStorage.setItem(LOCAL_STORAGE_KEY, newId)
  return newId
}

const identify = (sessionId?: string | null) => {
  const isPWA = isPWAMode()

  if (typeof umami != "undefined") {
    const data = {
      pwaMode: isPWA,
      userAgent: navigator.userAgent,
    }
    if (sessionId) {
      umami.identify(sessionId, data)
    } else {
      umami.identify(data)
    }
  }
}

const makeId = (): string => {
  const now = new Date()
  const timeStr = String(now.getTime())
  const randomStr = String(Math.random()).slice(2)
  return `${PREFIX}${timeStr}-${randomStr}`
}
