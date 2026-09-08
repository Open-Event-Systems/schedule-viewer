import { createRouter } from "../router/router.js"
import { RouterProvider } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { DEFAULT_THEME, MantineProvider } from "@mantine/core"
import type { InitialAppContextValue } from "../hooks/app.js"

export const App = ({
  setup,
}: {
  setup: (queryClient: QueryClient) => InitialAppContextValue
}) => {
  const [queryClient] = useState(() => new QueryClient())
  const [initialAppContext] = useState(() => setup(queryClient))
  const [router] = useState(() => {
    return createRouter({
      initialAppContext,
    })
  })

  return (
    <MantineProvider theme={DEFAULT_THEME}>
      <RouterProvider router={router} />
    </MantineProvider>
  )
}
