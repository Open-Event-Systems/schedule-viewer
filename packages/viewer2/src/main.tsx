import { createRoot } from "react-dom/client"
import { MantineProvider } from "@mantine/core"
import { App } from "./app.js"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"

const containerEl = document.getElementById("schedule")
if (containerEl) {
  const root = createRoot(containerEl)
  root.render(
    <MantineProvider>
      <App configURL="/config.json" />
    </MantineProvider>,
  )
}
