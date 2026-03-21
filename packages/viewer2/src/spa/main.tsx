import { createRoot } from "react-dom/client"
import { App } from "./app.js"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"
import "../styles.scss"

import { getJSConfig } from "../js-config.js"

const makeApp = (containerEl: Element) => {
  const root = createRoot(containerEl)
  const jsConfig = getJSConfig()

  root.render(<App jsConfig={jsConfig} />)
}

const containerEl = document.getElementById("schedule")
if (containerEl) {
  makeApp(containerEl)
}
