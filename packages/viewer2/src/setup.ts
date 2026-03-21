import { itemQueryOptions } from "@open-event-systems/schedule-react"
import { parsers } from "./schedule.js"
import type { AppContextValue } from "./types.js"

export const cacheData = async (appContext: AppContextValue) => {
  const { config, queryClient, scheduleAPI } = appContext
  return queryClient.fetchQuery(
    itemQueryOptions.items(scheduleAPI, config.id, parsers),
  )
}
