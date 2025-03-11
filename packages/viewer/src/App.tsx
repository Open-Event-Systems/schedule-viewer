import { createHashHistory, RouterProvider } from "@tanstack/react-router"
import { createContext, useState } from "react"
import { router } from "./router.js"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DEFAULT_THEME, MantineProvider } from "@mantine/core"
import { loadApp } from "./config.js"

export const App = ({ configURL }: { configURL: string }) => {
  const [history] = useState(() => {
    const history = createHashHistory()
    return history
  })

  const [queryClient] = useState(() => {
    return new QueryClient({})
  })

  const [appContextPromise] = useState(() => {
    return loadApp(queryClient, configURL)
  })

  const [filterSettings, setFilterSettings] = useState(
    (): FilterSettings => ({
      text: "",
      disabledTags: new Set(),
      showPast: false,
      onlyBookmarked: false,
    }),
  )

  return (
    <MantineProvider theme={DEFAULT_THEME}>
      <QueryClientProvider client={queryClient}>
        <FilterContext.Provider value={[filterSettings, setFilterSettings]}>
          <RouterProvider
            router={router}
            history={history}
            context={{
              configURL,
              queryClient,
              appContextPromise,
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
