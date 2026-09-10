import "@mantine/core/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"
import "../styles.scss"

import { RouterProvider } from "@tanstack/react-router"
import { createRoot } from "react-dom/client"
import { createRouter } from "../router/router.js"
import { getJSConfig, makeAppContext } from "../config/js-config.js"
import { QueryClient } from "@tanstack/react-query"

const container = document.getElementById("schedule")
if (container) {
  const jsConfig = getJSConfig()
  const queryClient = new QueryClient()
  const appContext = makeAppContext(jsConfig, queryClient, "spa")
  const router = createRouter(appContext)

  const root = createRoot(container)
  root.render(<RouterProvider router={router} />)
}
