import { QueryClientProvider } from "@tanstack/react-query"
import { Outlet, useMatches } from "@tanstack/react-router"
import { SWStoreContext } from "../sw/service-worker.js"
import { ViewerConfigContext } from "../config.js"
import {
  ScheduleAPIContext,
  ScheduleConfigContext,
  SelectionsServiceAPIContext,
  SessionSelectionsAPIContext,
} from "@open-event-systems/schedule-react"
import { PWAStoreContext } from "../sw/pwa.js"

export const Providers = () => {
  const context = useMatches({
    select(matches) {
      return matches[0]?.context
    },
  })

  if (!context) {
    throw new Error("No router context")
  }

  const {
    queryClient,
    pwaStore,
    swStore,
    config,
    scheduleAPI,
    selectionsServiceAPI,
    sessionSelectionsAPIs,
  } = context

  return (
    <QueryClientProvider client={queryClient}>
      <PWAStoreContext value={pwaStore}>
        <SWStoreContext value={swStore}>
          <ViewerConfigContext value={config}>
            <ScheduleConfigContext value={config}>
              <ScheduleAPIContext value={scheduleAPI}>
                <SelectionsServiceAPIContext value={selectionsServiceAPI}>
                  <SessionSelectionsAPIContext value={sessionSelectionsAPIs}>
                    <Outlet />
                  </SessionSelectionsAPIContext>
                </SelectionsServiceAPIContext>
              </ScheduleAPIContext>
            </ScheduleConfigContext>
          </ViewerConfigContext>
        </SWStoreContext>
      </PWAStoreContext>
    </QueryClientProvider>
  )
}
