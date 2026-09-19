import type { AppContextPromise } from "#src/app.js"
import { type ScheduleAPI } from "@open-event-systems/schedule-lib"
import { queryOptions } from "@tanstack/react-query"

export const ScheduleQueryKey = {
  items: ["items"],
} as const

export const ScheduleQueryOptions = {
  items: (api: ScheduleAPI) =>
    queryOptions({
      queryKey: ScheduleQueryKey.items,
      queryFn: async () => {
        const { indexScheduleData } =
          await import("@open-event-systems/schedule-lib")
        return indexScheduleData(await api.getItems())
      },
      staleTime: 300000,
      structuralSharing: false,
    }),
} as const

export const ScheduleLoader = {
  items: async (contextPromise: AppContextPromise) => {
    const { queryClient, scheduleAPI } = await contextPromise
    const res = await queryClient.query({
      ...ScheduleQueryOptions.items(scheduleAPI),
      staleTime: "static",
    })
    return res
  },
} as const
