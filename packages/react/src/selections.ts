import {
  composeSelectionsAPI,
  makeSessionSelectionsStore,
  setupSelectionsAPI,
  syncSelectionsAPIs,
  type SelectionsAPI,
  type SessionSelectionsStore,
} from "@open-event-systems/schedule-lib"
import type { ScheduleConfig } from "./types.js"

/**
 * Set up the selections API.
 */
export const setupSelections = async (
  config: ScheduleConfig,
  sessionId?: string,
): Promise<[SessionSelectionsStore, SelectionsAPI]> => {
  const local = makeSessionSelectionsStore(config.id)
  const apiURL = config.selectionsService || config.bookmarks
  if (!apiURL) {
    return [local, composeSelectionsAPI(local)]
  }

  try {
    const remote = await setupSelectionsAPI(apiURL, config.id, sessionId)

    await Promise.all([
      syncSelectionsAPIs(local, remote, "bookmarks"),
      syncSelectionsAPIs(local, remote, "visited"),
    ])

    return [local, composeSelectionsAPI(local, remote)]
  } catch (e) {
    console.error(`Ignoring remote selections service: ${e}`)
    return [local, composeSelectionsAPI(local)]
  }
}
