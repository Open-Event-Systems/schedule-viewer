/**
 * Main entry point for the SPA.
 */

import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"
import "@open-event-systems/schedule-map/schedule-map.css"
import "../styles.scss"

import { createRoot } from "react-dom/client"
import { App } from "./app.js"

import { StrictMode } from "react"

const dev = import.meta.env.DEV

const makeApp = (containerEl: Element) => {
  const root = createRoot(containerEl)

  if (dev) {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } else {
    root.render(<App />)
  }
}

const containerEl = document.getElementById("schedule")
if (containerEl) {
  makeApp(containerEl)
}
