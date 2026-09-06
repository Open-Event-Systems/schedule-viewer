import {
  DEFAULT_CONFIG,
  makeScheduleAPIFromConfig,
  type ViewerConfig,
} from "../config/config.js"
import { App } from "../app/app.js"
import { makeLocalStorageSessionSelectionsStore } from "@open-event-systems/schedule-lib"
import { createRoot } from "react-dom/client"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"
import "../styles.scss"
import type { QueryClient } from "@tanstack/react-query"
import type { InitialAppContextValue } from "../hooks/app.js"

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

const testSetup = (queryClient: QueryClient): InitialAppContextValue => {
  const config = testConfig

  return {
    queryClient,
    config: Promise.resolve(config),
    scheduleAPI: Promise.resolve(makeScheduleAPIFromConfig(config)),
    selectionsStore: Promise.resolve(
      makeLocalStorageSessionSelectionsStore(config.id),
    ),
  }
}

const container = document.getElementById("schedule")
if (container) {
  const root = createRoot(container)
  root.render(<App setup={testSetup} />)
}
