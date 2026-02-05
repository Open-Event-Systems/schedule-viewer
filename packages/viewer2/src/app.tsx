import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { makeRouter } from "./router.js"
import { RouterProvider } from "@tanstack/react-router"
import { loadConfig, type ViewerConfig } from "./config.js"
import {
  makeScheduleAPIFromConfig,
  setupSelections,
} from "@open-event-systems/schedule-react"
import {
  type ScheduleAPI,
  type SelectionsAPI,
  type SessionSelectionsStore,
} from "@open-event-systems/schedule-lib"

export type SetupResult = {
  config: ViewerConfig
  scheduleAPI: ScheduleAPI
  sessionSelectionsStore: SessionSelectionsStore
  selectionsAPI: SelectionsAPI
}

export const App = ({ configURL }: { configURL: string }) => {
  const [{ queryClient, router }] = useState(() => {
    const queryClient = new QueryClient()
    const setupPromise = setup(configURL)
    return {
      queryClient,
      router: makeRouter({
        setupPromise,
        queryClient,
      }),
    }
  })
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

const setup = async (configURL: string): Promise<SetupResult> => {
  const config = await loadConfig(configURL)

  const scheduleAPI = makeScheduleAPIFromConfig(config)
  const [sessionSelectionsStore, selectionsAPI] = await setupSelections(config)

  return {
    config,
    scheduleAPI,
    sessionSelectionsStore,
    selectionsAPI,
  }
}
