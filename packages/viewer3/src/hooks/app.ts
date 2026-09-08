import type { QueryClient } from "@tanstack/react-query"
import type { ViewerConfig } from "../config/config.js"
import type { ScheduleAPI, SelectionsStore } from "@open-event-systems/schedule-lib"
import { use } from "react"
import { rootRoute } from "../router/routes/root.js"


export type AppContextValue = Readonly<{
  queryClient: QueryClient
  config: Promise<ViewerConfig>
  scheduleAPI: Promise<ScheduleAPI>
  selectionsStore: Promise<SelectionsStore>
}>

export type AwaitedAppContextValue = {
  [K in keyof AppContextValue]: Awaited<AppContextValue[K]>
}

export const awaitAppContext = async (appContext: AppContextValue): Promise<AwaitedAppContextValue> => {
  const awaited = {} as Record<
    keyof AppContextValue,
    Awaited<AppContextValue[keyof AppContextValue]>
  >

  Object.entries(appContext).map(async ([k, v]) => {
    const key = k as keyof AppContextValue
    awaited[key] = await v
  })

  return awaited as AwaitedAppContextValue
}


export const useAppContext = (): AwaitedAppContextValue => {
  const { appContextPromise } = rootRoute.useRouteContext()
  const appContext = use(appContextPromise)
  return appContext
}
