import type { Selections, SelectionsService, SelectionsStore, SelectionsType } from "#src/types.js"

const getIsOnline = () => !("onLine" in window.navigator && window.navigator.onLine === false)

/**
 * Return a {@link SelectionsStore} that updates both the local and remote
 * selections.
 */
export const makeSyncedSelectionsStore = (
  local: SelectionsStore,
  remote?: SelectionsService | null,
): SelectionsStore => {
  const syncPromises = new Map<SelectionsType, Promise<Selections>>()
  let lastError: number | null = null

  const getHasError = () => {
    return lastError != null && new Date().getTime() - lastError < 60000
  }

  const doInitialSync = async (type: SelectionsType) => {
    if (!remote || getHasError() || !getIsOnline()) {
      return
    }

    let syncPromise = syncPromises.get(type)

    if (!syncPromise) {
      syncPromise = syncSessionSelections(type, local, remote).catch((e) => {
        console.warn(`initial ${type} selections sync failed: ${e}`)
        syncPromises.delete(type)
        lastError = new Date().getTime()
        throw e
      })
      syncPromises.set(type, syncPromise)
    }

    await syncPromise.catch(() => {})
  }

  return {
    load: async (type) => {
      await doInitialSync(type)
      return await local.load(type)
    },
    save: async (type, selections) => {
      await doInitialSync(type)
      const updatedLocal = await local.save(type, selections)

      if (remote && getIsOnline() && !getHasError()) {
        try {
          const updatedRemote = await remote.save(type, updatedLocal)
          const finalLocal = await local.save(type, updatedRemote)
          return finalLocal
        } catch (e) {
          console.warn(`sync failed: ${e}`)
          lastError = new Date().getTime()
          return updatedLocal
        }
      } else {
        return updatedLocal
      }
    },
  }
}

/**
 * Sync remote and local selections.
 */
export const syncSessionSelections = async (
  type: SelectionsType,
  local: SelectionsStore,
  remote: SelectionsService,
): Promise<Selections> => {
  const [curLocal, curRemote] = await Promise.all([local.load(type), remote.load(type)])

  if (!curLocal.equals(curRemote)) {
    const updatedRemote = await remote.save(type, curLocal)
    const finalLocal = await local.save(type, updatedRemote)
    return finalLocal
  } else {
    return curLocal
  }
}
