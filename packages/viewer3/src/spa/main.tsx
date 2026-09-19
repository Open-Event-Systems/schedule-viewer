import "@mantine/core/styles.css"

import "@open-event-systems/schedule-react/schedule-react.css"

import "../styles.scss"

import {
  makeSWState,
  registerReloadHandler,
  SWStateProvider,
} from "#src/sw/register.js"
import { QueryClient } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { createRoot } from "react-dom/client"
import { getJSConfig, makeAppContext } from "../config/js-config.js"
import { createRouter } from "../router/router.js"

const container = document.getElementById("schedule")
if (container) {
  const jsConfig = getJSConfig()
  const queryClient = new QueryClient()
  const appContext = makeAppContext(jsConfig, queryClient, "spa")
  const router = createRouter(appContext)

  const swState = makeSWState()
  registerReloadHandler()
  swState.register(jsConfig.basePath)

  const root = createRoot(container)
  root.render(
    <SWStateProvider value={swState}>
      <RouterProvider router={router} />
    </SWStateProvider>,
  )
}
