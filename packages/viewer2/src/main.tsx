import { createRoot } from "react-dom/client"
import { MantineProvider } from "@mantine/core"
import { App } from "./app.js"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"
import "./styles.scss"

const makeApp = (containerEl: Element) => {
  const root = createRoot(containerEl)
  const jsConfig = window.scheduleConfig

  root.render(
    <MantineProvider
      theme={jsConfig?.theme}
      forceColorScheme={jsConfig?.colorScheme}
    >
      <App jsConfig={jsConfig} />
    </MantineProvider>,
  )
}

const containerEl = document.getElementById("schedule")
if (containerEl) {
  makeApp(containerEl)
}
