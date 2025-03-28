import { createBrowserHistory, RouterProvider } from "@tanstack/react-router"
import { createContext, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  MantineColorScheme,
  MantineProvider,
  MantineThemeOverride,
} from "@mantine/core"
import { router } from "../router.js"
import { makeAppConfig } from "../config.js"
import { useSWStore } from "../service-worker.js"

export const App = ({
  basePath,
  theme,
  colorScheme,
}: {
  basePath?: string
  theme?: MantineThemeOverride
  colorScheme?: MantineColorScheme
}) => {
  const [history] = useState(() => {
    const history = createBrowserHistory()
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
    return makeAppConfig(queryClient, getConfigURL(basePath)).then((ctx) => {
      if (ctx.config.serviceWorker) {
        swStore.register(basePath)
      }
      return ctx
    })
  })

  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <QueryClientProvider client={queryClient}>
        <FilterContext.Provider value={[filterSettings, setFilterSettings]}>
          <RouterProvider
            basepath={basePath}
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

const getConfigURL = (basePath = "") => {
  if (basePath == "") {
    return "config.json"
  } else if (basePath == "/") {
    return "/config.json"
  } else {
    return `${basePath}/config.json`
  }
}
