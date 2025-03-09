import {
  makeSelections,
  Selections,
} from "@open-event-systems/schedule-lib"
import { parseISO } from "date-fns"

const LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-bookmarks-v1-"

const getKey = (scheduleId: string): string =>
  `${LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`

const stringifySelections = (selections: Selections): string => {
  const data = {
    eventIds: Array.from(selections),
    dateUpdated: selections.dateUpdated.toISOString(),
  }

  return JSON.stringify(data)
}

const parseSelections = (dataStr: string): Selections => {
  const data: unknown = JSON.parse(dataStr)
  let eventIds: string[] = []
  let dateUpdated = new Date(0)
  if (data && typeof data == "object") {
    if ("eventIds" in data && Array.isArray(data.eventIds)) {
      eventIds = data.eventIds.map(String)
    }
    if ("dateUpdated" in data && typeof data.dateUpdated == "string") {
      dateUpdated = parseISO(data.dateUpdated)
    }
  }

  return makeSelections(eventIds, dateUpdated)
}

/**
 * Save the given {@link Selections} to local storage.
 */
export const saveSelections = (scheduleId: string, selections: Selections) => {
  window.localStorage.setItem(
    getKey(scheduleId),
    stringifySelections(selections)
  )
}

/**
 * Load a {@link Selections} from local storage.
 */
export const loadSelections = (scheduleId: string): Selections => {
  const dataStr = window.localStorage.getItem(getKey(scheduleId))
  if (dataStr) {
    try {
      return parseSelections(dataStr)
    } catch (_) {}
  }
  return makeSelections()
}

/**
 * Register a handler to be called when the stored selections are updated.
 * @returns A function to cancel the handler
 */
export const listenForStorageUpdates = (
  scheduleId: string,
  handler: (selections: Selections) => void
): (() => void) => {
  const key = getKey(scheduleId)
  const eventHandler = (e: StorageEvent) => {
    if (e.storageArea == window.localStorage && e.key == key && e.newValue) {
      try {
        const updated = parseSelections(e.newValue)
        handler(updated)
      } catch (_) {}
    }
  }

  window.addEventListener("storage", eventHandler)

  return () => window.removeEventListener("storage", eventHandler)
}
