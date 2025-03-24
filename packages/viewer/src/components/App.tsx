import { createHashHistory, RouterProvider } from "@tanstack/react-router"
import { createContext, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  DEFAULT_THEME,
  MantineColorScheme,
  MantineProvider,
  MantineThemeOverride,
} from "@mantine/core"
import {
  BookmarkAPI,
  makeBookmarkAPI,
  RequiredScheduleConfig,
} from "@open-event-systems/schedule-lib"
import { router } from "../router.js"

export const App = ({
  config,
  theme,
  colorScheme,
}: {
  config: RequiredScheduleConfig
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

  const [bookmarkAPI] = useState<BookmarkAPI | undefined>(() => {
    if (config.bookmarks) {
      return makeBookmarkAPI(config.bookmarks)
    } else {
      return
    }
  })

  const [filterSettings, setFilterSettings] = useState(
    (): FilterSettings => ({
      text: "",
      disabledTags: new Set(),
      showPast: false,
      onlyBookmarked: false,
    }),
  )

  const fullTheme = {
    DEFAULT_THEME,
    ...theme,
  }

  return (
    <MantineProvider theme={fullTheme} defaultColorScheme={colorScheme}>
      <QueryClientProvider client={queryClient}>
        <FilterContext.Provider value={[filterSettings, setFilterSettings]}>
          <RouterProvider
            router={router}
            history={history}
            context={{
              config,
              queryClient,
              bookmarkAPI,
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
