import { createHashHistory, RouterProvider } from "@tanstack/react-router"
import { useState } from "react"
import { router } from "./router.js"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DEFAULT_THEME, MantineProvider } from "@mantine/core"
import { LocalStorageBookmarkStore } from "./bookmarks.js"
import { makeBookmarkStore } from "@open-event-systems/schedule-lib"

export const App = ({ configURL }: { configURL: string }) => {
  const [history] = useState(() => {
    const history = createHashHistory()
    return history
  })

  const [queryClient] = useState(() => {
    return new QueryClient({})
  })

  const [bookmarkStoreFactory] = useState(() => {
    return {
      factory(scheduleId: string) {
        return LocalStorageBookmarkStore.load(makeBookmarkStore, scheduleId)
      },
    }
  })

  return (
    <MantineProvider theme={DEFAULT_THEME}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider
          router={router}
          history={history}
          context={{
            configURL,
            queryClient,
            bookmarkStoreFactory: bookmarkStoreFactory.factory,
          }}
        />
      </QueryClientProvider>
    </MantineProvider>
  )
}
