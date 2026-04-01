import { itemQueryOptions } from "@open-event-systems/schedule-react"
import type { AppContextValue } from "./types.js"

export const cacheData = async (appContext: AppContextValue) => {
  const { config, queryClient, scheduleAPI } = appContext
  const { parsers } = await import("./schedule.js")
  return queryClient.fetchQuery({
    ...itemQueryOptions.items(scheduleAPI, config.id, parsers),
    staleTime: 0,
  })
}
