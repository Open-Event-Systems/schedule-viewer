import type { ScheduleAPI } from "@open-event-systems/schedule-lib"
import { queryOptions } from "@tanstack/react-query"
import type { AppContextValue } from "../hooks/app.js"

export const ScheduleQueryKey = {
  items: ["items"],
} as const

export const ScheduleQueryOptions = {
  items: (api: ScheduleAPI) => queryOptions({
    queryKey: ScheduleQueryKey.items,
    queryFn: async () => {
      return await api.getItems()
    },
    staleTime: 300000,
  })
} as const

export const ScheduleLoader = {
  items: async (contextPromise: Promise<AppContextValue>) => {
    const { queryClient, scheduleAPI } = await contextPromise
    return await queryClient.fetchQuery(ScheduleQueryOptions.items(scheduleAPI))
  }
} as const
