import {
  DEFAULT_CONFIG,
  makeScheduleAPIFromConfig,
  type ViewerConfig,
} from "../config/config.js"
import { makeLocalStorageSessionSelectionsStore } from "@open-event-systems/schedule-lib"
import { createRoot } from "react-dom/client"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"
import "../styles.scss"
import { QueryClient } from "@tanstack/react-query"
import { createRouter, type SetupFuncReturnValue } from "../router/router.js"
import { createBrowserHistory, RouterProvider } from "@tanstack/react-router"

const testConfig: ViewerConfig = {
  ...DEFAULT_CONFIG,
  id: window.location.origin,
  tags: [
    {
      value: "main-event",
      label: "Main Event",
      before: "⭐",
    },
    {
      value: "photography",
      label: "Photography",
      before: "📷",
    },
  ],
}

const testSetup = (): SetupFuncReturnValue => {
  const config = testConfig
  const queryClient = new QueryClient()

  const history = createBrowserHistory()

  return {
    history,
    appContext: {
      queryClient,
      config: Promise.resolve(config),
      scheduleAPI: Promise.resolve(makeScheduleAPIFromConfig(config)),
      selectionsStore: Promise.resolve(
        makeLocalStorageSessionSelectionsStore(config.id),
      ),
    },
  }
}

const container = document.getElementById("schedule")
if (container) {
  const root = createRoot(container)
  const router = createRouter(testSetup)

  root.render(<RouterProvider router={router} />)
}
