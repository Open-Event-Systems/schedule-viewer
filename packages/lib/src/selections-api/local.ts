/**
 * Local selections store implementations.
 *
 * @module
 */

import {
  makeSelections,
  makeTrackedSelections,
  parseSelections,
  unparseSelections,
} from "#src/selections.js"
import type { Selections, SelectionsStore, SelectionsType } from "#src/types.js"

const SELECTIONS_LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-selections-v3-"

/**
 * A {@link SessionSelectionsStore} that stores data in memory.
 */
export const makeMemoryLocalSelectionsStore = (): SelectionsStore => {
  const byType = new Map<SelectionsType, Selections>()

  return {
    load: async (type) => {
      let cur = byType.get(type)
      if (cur == null) {
        cur = makeTrackedSelections(makeSelections())
        byType.set(type, cur)
      }

      return cur
    },
    save: async (type, selections) => {
      byType.set(type, selections)
      return selections
    },
  }
}

export type LocalStorageSelectionsStore = SelectionsStore &
  Readonly<{
    handleStorageEvent: (type: SelectionsType, e: StorageEvent) => Selections | null | false
  }>

export const makeLocalStorageSessionSelectionsStore = (
  scheduleId: string,
  storage?: Storage,
): LocalStorageSelectionsStore => {
  storage = storage ?? window.localStorage
  const getStorageKey = (type: SelectionsType) =>
    `${SELECTIONS_LOCAL_STORAGE_KEY_PREFIX}${type}-${scheduleId}`

  const getFromStorage = (type: SelectionsType): Selections | null => {
    let errObj
    try {
      const dataStr = storage.getItem(getStorageKey(type))
      if (!dataStr) {
        return null
      }

      const data = JSON.parse(dataStr)
      const res = parseSelections(data)
      if (res.success) {
        return res.data
      } else {
        errObj = res.message
      }
    } catch (e) {
      errObj = e
    }

    console.warn(`failed to load selections from storage: ${errObj}`)
    return null
  }

  const saveToStorage = (type: SelectionsType, selections: Selections) => {
    const data = unparseSelections(selections)
    storage.setItem(getStorageKey(type), JSON.stringify(data))
  }

  const currentFromStorage = new Map<SelectionsType, Selections>()

  const getCurrent = (type: SelectionsType): Selections => {
    let cur = currentFromStorage.get(type)
    if (cur == null) {
      cur = getFromStorage(type) ?? makeTrackedSelections(makeSelections())
      currentFromStorage.set(type, cur)
    }
    return cur
  }

  const setCurrent = (type: SelectionsType, selections: Selections) => {
    currentFromStorage.set(type, selections)
  }

  return {
    load: async (type) => {
      return getCurrent(type)
    },
    save: async (type, selections) => {
      setCurrent(type, selections)
      saveToStorage(type, selections)
      return selections
    },
    handleStorageEvent: (type, e) => {
      const storageKey = getStorageKey(type)
      if (e.storageArea == storage && e.key == storageKey) {
        const newCur = getFromStorage(type)
        if (newCur) {
          setCurrent(type, newCur)
        }
        return newCur
      } else {
        return false
      }
    },
  }
}
