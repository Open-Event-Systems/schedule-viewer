import { Outlet } from "@tanstack/react-router"
import { ViewerConfigContext } from "../config.js"
import {
  ScheduleAPIContext,
  ScheduleConfigContext,
  SelectionsAPIContext,
} from "@open-event-systems/schedule-react"
import { QueryClientProvider } from "@tanstack/react-query"
import { SWStoreContext } from "../service-worker.js"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { scheduleSetupRoute } from "../routes.js"

const dev = import.meta.env.DEV

export const ScheduleSetupRoute = () => {
  const { queryClient, swStore, config, scheduleAPI, selectionsAPI } =
    scheduleSetupRoute.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <SWStoreContext value={swStore}>
        <ScheduleConfigContext value={config}>
          <ViewerConfigContext value={config}>
            <ScheduleAPIContext value={scheduleAPI}>
              <SelectionsAPIContext value={selectionsAPI}>
                <Outlet />
                {dev && <TanStackRouterDevtools />}
                {dev && <ReactQueryDevtools />}
              </SelectionsAPIContext>
            </ScheduleAPIContext>
          </ViewerConfigContext>
        </ScheduleConfigContext>
      </SWStoreContext>
    </QueryClientProvider>
  )
}
