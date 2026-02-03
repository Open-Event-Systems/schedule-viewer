import {
  composeSelectionsAPI,
  makeLocalStorageSelectionsAPI,
  type SelectionsAPI,
  type SelectionsServiceAPI,
  setupSelectionsServiceAPI,
  syncSelectionsAPIs,
} from "@open-event-systems/schedule-lib"
import type { ScheduleConfig } from "./types.js"

/**
 * Set up the selections API.
 */
export const setupSelections = async (
  config: ScheduleConfig,
  sessionId?: string,
): Promise<SelectionsAPI | SelectionsServiceAPI> => {
  const local = makeLocalStorageSelectionsAPI(config.id)
  const apiURL = config.selectionsService || config.bookmarks
  if (!apiURL) {
    return local
  }

  try {
    const remote = await setupSelectionsServiceAPI(apiURL, config.id, sessionId)

    await Promise.all([
      syncSelectionsAPIs(local, remote, "bookmarks"),
      syncSelectionsAPIs(local, remote, "visited"),
    ])

    return composeSelectionsAPI(local, remote)
  } catch (e) {
    console.error(`Ignoring remote selections service: ${e}`)
    return local
  }
}
