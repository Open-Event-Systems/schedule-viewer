import type { QueryClient } from "@tanstack/react-query"
import type { ViewerConfig } from "../config/config.js"
import type {
  ScheduleAPI,
  SelectionsStore,
} from "@open-event-systems/schedule-lib"
import { createContext, use, useEffect, useState } from "react"
import type { MantineThemeOverride } from "@mantine/core"

export type AppContextValue = Readonly<{
  appType: "spa" | "ssr"
  origin: string
  basePath: string
  queryClient: QueryClient
  config: Promise<ViewerConfig>
  scheduleAPI: Promise<ScheduleAPI>
  selectionsStore: Promise<SelectionsStore>
  theme?: MantineThemeOverride
}>

export type AwaitedAppContextValue = {
  [K in keyof AppContextValue]: Awaited<AppContextValue[K]>
}

export const awaitAppContext = async (
  appContext: AppContextValue,
): Promise<AwaitedAppContextValue> => {
  const awaited = {} as Record<
    keyof AwaitedAppContextValue,
    AwaitedAppContextValue[keyof AwaitedAppContextValue]
  >

  const promises = Object.keys(appContext).map(async (k) => {
    const key = k as keyof AppContextValue
    awaited[key] = await appContext[key]
  })

  await Promise.all(promises)
  return awaited as AwaitedAppContextValue
}

export const AppContext = createContext<Promise<AwaitedAppContextValue>>(
  new Promise<AwaitedAppContextValue>(() => {}),
)

export const useAppContext = (): AwaitedAppContextValue => {
  const ctxPromise = use(AppContext)
  const ctx = use(ctxPromise)
  return ctx
}

export const useIsSSR = (): boolean => {
  const ctx = useAppContext()
  return ctx.appType == "ssr"
}

/**
 * Use a default value during SSR rendering and hydration.
 */
export const useSSRValue = <V, D>(value: V, ssrValue: D): V | D => {
  const [ssr, setSSR] = useState(useIsSSR())

  useEffect(() => {
    setSSR(false)
  }, [])

  return ssr ? ssrValue : value
}
