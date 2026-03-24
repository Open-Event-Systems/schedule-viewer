/**
 * Main entry point for the SPA.
 */

import { createRoot } from "react-dom/client"
import { App } from "./app.js"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"
import "../styles.scss"

import { getSPAConfig } from "./config.js"
import { StrictMode } from "react"

const dev = import.meta.env.DEV

const makeApp = (containerEl: Element) => {
  const root = createRoot(containerEl)
  const spaConfig = getSPAConfig()

  if (dev) {
    root.render(
      <StrictMode>
        <App spaConfig={spaConfig} />
      </StrictMode>,
    )
  } else {
    root.render(<App spaConfig={spaConfig} />)
  }
}

const containerEl = document.getElementById("schedule")
if (containerEl) {
  makeApp(containerEl)
}
