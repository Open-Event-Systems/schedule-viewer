import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { makeRouter } from "./router.js"
import { RouterProvider } from "@tanstack/react-router"
import { loadConfig, type ViewerConfig } from "./config.js"
import {
  itemsQueryFns,
  itemsQueryKeys,
  makeScheduleAPIFromConfig,
  setupSelections,
} from "@open-event-systems/schedule-react"
import {
  type ScheduleAPI,
  type SelectionsAPI,
  type SessionSelectionsStore,
} from "@open-event-systems/schedule-lib"
import type { SWStore } from "./service-worker.js"
import { parsers } from "./schedule.js"

export type SetupResult = {
  config: ViewerConfig
  scheduleAPI: ScheduleAPI
  sessionSelectionsStore: SessionSelectionsStore
  selectionsAPI: SelectionsAPI
}

export const App = ({
  configURL,
  history,
  basePath,
  swStore,
}: {
  configURL: string
  history?: "browser" | "hash"
  basePath?: string
  swStore?: SWStore
}) => {
  const [{ queryClient, router }] = useState(() => {
    const queryClient = new QueryClient()
    const setupPromise = setup(configURL)

    // refetch data after SW install to get it in the runtime cache
    setupPromise.then(({ config, scheduleAPI }) => {
      return swStore?.firstReady.then(() => {
        console.info("Refetching data for cache")
        return queryClient.fetchQuery({
          queryKey: itemsQueryKeys.items(config.id, parsers),
          queryFn: itemsQueryFns.items(scheduleAPI, parsers),
        })
      })
    })

    return {
      queryClient,
      router: makeRouter(
        {
          setupPromise,
          queryClient,
        },
        history,
      ),
    }
  })
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        basepath={history == "browser" ? basePath : undefined}
      />
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
