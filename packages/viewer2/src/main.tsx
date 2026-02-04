import { createRoot } from "react-dom/client"
import { MantineProvider } from "@mantine/core"
import { App } from "./app.js"

const containerEl = document.getElementById("schedule")
if (containerEl) {
  const root = createRoot(containerEl)
  root.render(
    <MantineProvider>
      <App />
    </MantineProvider>,
  )
}
