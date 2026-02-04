import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { makeRouter } from "./router.js"
import { RouterProvider } from "@tanstack/react-router"

export const App = () => {
  const [{ queryClient, router }] = useState(() => {
    return {
      queryClient: new QueryClient(),
      router: makeRouter(),
    }
  })
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
