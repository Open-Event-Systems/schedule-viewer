import { createHashHistory, RouterProvider } from "@tanstack/react-router"
import { createContext, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  MantineColorScheme,
  MantineProvider,
  MantineThemeOverride,
} from "@mantine/core"
import { BookmarkAPI, makeBookmarkAPI } from "@open-event-systems/schedule-lib"
import { router } from "../router.js"
import { makeAppConfig } from "../config.js"
import { useSWStore } from "../service-worker.js"

export const App = ({
  theme,
  colorScheme,
}: {
  theme?: MantineThemeOverride
  colorScheme?: MantineColorScheme
}) => {
  const [history] = useState(() => {
    const history = createHashHistory()
    return history
  })

  const [queryClient] = useState(() => {
    return new QueryClient({})
  })

  const [filterSettings, setFilterSettings] = useState(
    (): FilterSettings => ({
      text: "",
      disabledTags: new Set(),
      showPast: false,
      onlyBookmarked: false,
    }),
  )

  const swStore = useSWStore()

  const [appConfigPromise] = useState(() => {
    return makeAppConfig(queryClient, "config.json").then((ctx) => {
      if (ctx.config.serviceWorker) {
        swStore.register()
      }
      return ctx
    })
  })

  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <QueryClientProvider client={queryClient}>
        <FilterContext.Provider value={[filterSettings, setFilterSettings]}>
          <RouterProvider
            router={router}
            history={history}
            context={{
              appConfigPromise: appConfigPromise,
              queryClient,
            }}
          />
        </FilterContext.Provider>
      </QueryClientProvider>
    </MantineProvider>
  )
}

export type FilterSettings = Readonly<{
  text: string
  disabledTags: ReadonlySet<string>
  showPast: boolean
  onlyBookmarked: boolean
}>

export const FilterContext = createContext<
  readonly [FilterSettings, (newSettings: FilterSettings) => void]
>([
  {
    text: "",
    disabledTags: new Set(),
    showPast: false,
    onlyBookmarked: false,
  },
  () => {},
])
