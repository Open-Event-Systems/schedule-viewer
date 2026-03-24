import { QueryClientProvider } from "@tanstack/react-query"
import { Outlet, useMatches } from "@tanstack/react-router"
import { SWStoreContext } from "../service-worker.js"
import { ViewerConfigContext } from "../config.js"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  ScheduleAPIContext,
  ScheduleConfigContext,
  SelectionsAPIContext,
} from "@open-event-systems/schedule-react"

const dev = import.meta.env.DEV

export const Providers = () => {
  const context = useMatches({
    select(matches) {
      return matches[0]?.context
    },
  })

  if (!context) {
    throw new Error("No router context")
  }

  const { queryClient, swStore, config, scheduleAPI, selectionsAPI } = context

  return (
    <QueryClientProvider client={queryClient}>
      <SWStoreContext value={swStore}>
        <ViewerConfigContext value={config}>
          <ScheduleConfigContext value={config}>
            <ScheduleAPIContext value={scheduleAPI}>
              <SelectionsAPIContext value={selectionsAPI}>
                <Outlet />
                {dev && <TanStackRouterDevtools />}
                {dev && <ReactQueryDevtools />}
              </SelectionsAPIContext>
            </ScheduleAPIContext>
          </ScheduleConfigContext>
        </ViewerConfigContext>
      </SWStoreContext>
    </QueryClientProvider>
  )
}
