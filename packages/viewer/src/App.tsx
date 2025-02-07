import { createHashHistory, RouterProvider } from "@tanstack/react-router"
import { useState } from "react"
import { router } from "./router.js"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DEFAULT_THEME, MantineProvider } from "@mantine/core"
import { BookmarkStore } from "./bookmarks.js"

export const App = ({ configURL }: { configURL: string }) => {
  const [history] = useState(() => {
    const history = createHashHistory()
    return history
  })

  const [queryClient] = useState(() => {
    return new QueryClient({})
  })

  const [bookmarkStore] = useState(() => {
    return new BookmarkStore()
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
            bookmarkStore,
          }}
        />
      </QueryClientProvider>
    </MantineProvider>
  )
}
