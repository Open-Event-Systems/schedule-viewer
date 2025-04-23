import {
  createBrowserHistory,
  createHashHistory,
  RouterProvider,
} from "@tanstack/react-router"
import { createContext, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  MantineColorScheme,
  MantineProvider,
  MantineThemeOverride,
} from "@mantine/core"
import { router } from "../router.js"
import { makeAppConfig } from "../config.js"

export const App = ({
  routerType = "hash",
  basePath,
  theme,
  colorScheme,
}: {
  routerType?: "hash" | "browser"
  basePath?: string
  theme?: MantineThemeOverride
  colorScheme?: MantineColorScheme
}) => {
  const [history] = useState(() => {
    const history =
      routerType == "browser" ? createBrowserHistory() : createHashHistory()
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

  const [appConfigPromise] = useState(() => {
    return makeAppConfig(queryClient, `${basePath}config.json`)
  })

  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <QueryClientProvider client={queryClient}>
        <FilterContext.Provider value={[filterSettings, setFilterSettings]}>
          <RouterProvider
            basepath={basePath || "/"}
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
