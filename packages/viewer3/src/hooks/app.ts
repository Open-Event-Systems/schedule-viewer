import type { QueryClient } from "@tanstack/react-query"
import type { ViewerConfig } from "../config/config.js"
import type { ScheduleAPI, SelectionsStore } from "@open-event-systems/schedule-lib"
import { use } from "react"
import { rootRoute } from "../routes/root.js"


export type InitialAppContextValue = Readonly<{
  queryClient: QueryClient
  config: Promise<ViewerConfig>
  scheduleAPI: Promise<ScheduleAPI>
  selectionsStore: Promise<SelectionsStore>
}>

export type AppContextValue = {
  [K in keyof InitialAppContextValue]: Awaited<InitialAppContextValue[K]>
}

export const awaitAppContext = async (initialAppContext: InitialAppContextValue): Promise<AppContextValue> => {
  const awaited = {} as Record<
    keyof InitialAppContextValue,
    Awaited<InitialAppContextValue[keyof InitialAppContextValue]>
  >

  Object.entries(initialAppContext).map(async ([k, v]) => {
    const key = k as keyof InitialAppContextValue
    awaited[key] = await v
  })

  return awaited as AppContextValue
}


export const useAppContext = (): AppContextValue => {
  const { appContextPromise } = rootRoute.useRouteContext()
  const appContext = use(appContextPromise)
  return appContext
}
