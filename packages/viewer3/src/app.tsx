import type { MantineThemeOverride } from "@mantine/core"
import type {
  ScheduleAPI,
  SelectionsStore,
} from "@open-event-systems/schedule-lib"
import {
  type BaseAppContext,
  type AwaitedAppContext as BaseAwaitedAppContext,
} from "@open-event-systems/schedule-react"
import type { QueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { use } from "react"
import type { ViewerConfig } from "./config/config.js"

export type AppContext = BaseAppContext &
  Readonly<{
    queryClient: QueryClient
    config: Promise<ViewerConfig>
    scheduleAPI: Promise<ScheduleAPI>
    selectionsStore: Promise<SelectionsStore>
    theme?: MantineThemeOverride
  }>

export type AwaitedAppContext = BaseAwaitedAppContext<AppContext>
export type AppContextPromise = Promise<AwaitedAppContext>

const routeApi = getRouteApi("__root__")

export const useAppContext = (): AwaitedAppContext => {
  const appContextPromise = routeApi.useRouteContext({
    select: ({ appContextPromise }) => appContextPromise,
  })
  return use(appContextPromise)
}
