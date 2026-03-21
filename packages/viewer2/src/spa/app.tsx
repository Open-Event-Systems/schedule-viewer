import {
  RouterProvider,
  useAwaited,
  type Register,
} from "@tanstack/react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { SWStoreContext } from "../service-worker.js"
import { MantineProvider } from "@mantine/core"
import type { AppContextValue, ScheduleJSConfig } from "../types.js"
import { ViewerConfigContext } from "../config.js"
import {
  ScheduleAPIContext,
  ScheduleConfigContext,
  SelectionsAPIContext,
} from "@open-event-systems/schedule-react"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Loading } from "../components/loading/loading.js"
import { Suspense, useState } from "react"
import {
  getHeadElements,
  InitialHeadContext,
} from "../components/head/deduped-head.js"

const dev = import.meta.env.DEV

export const App = ({ jsConfig }: { jsConfig: ScheduleJSConfig }) => {
  const [initialHeadElements] = useState(() => getHeadElements())

  const [setupPromise] = useState(() =>
    import("./setup.js").then(({ setup }) => setup(jsConfig)),
  )

  return (
    <MantineProvider
      theme={jsConfig.theme}
      forceColorScheme={jsConfig.colorScheme}
    >
      <InitialHeadContext value={initialHeadElements}>
        <Suspense fallback={<Loading />}>
          <Providers setupPromise={setupPromise} />
        </Suspense>
      </InitialHeadContext>
    </MantineProvider>
  )
}

const Providers = ({
  setupPromise,
}: {
  setupPromise: Promise<{
    context: AppContextValue
    router: Register["router"]
  }>
}) => {
  const {
    context: { queryClient, swStore, config, scheduleAPI, selectionsAPI },
    router,
  } = useAwaited({ promise: setupPromise })
  return (
    <QueryClientProvider client={queryClient}>
      <SWStoreContext value={swStore}>
        <ViewerConfigContext value={config}>
          <ScheduleConfigContext value={config}>
            <ScheduleAPIContext value={scheduleAPI}>
              <SelectionsAPIContext value={selectionsAPI}>
                <RouterProvider router={router} />
                {dev && <TanStackRouterDevtools router={router} />}
                {dev && <ReactQueryDevtools />}
              </SelectionsAPIContext>
            </ScheduleAPIContext>
          </ScheduleConfigContext>
        </ViewerConfigContext>
      </SWStoreContext>
    </QueryClientProvider>
  )
}
