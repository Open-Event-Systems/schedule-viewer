import { createRoot } from "react-dom/client"
import { App } from "./components/App.js"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-components/styles.scss"
import {
  createTheme,
  MantineColorScheme,
  MantineThemeOverride,
} from "@mantine/core"
declare global {
  interface Window {
    scheduleTheme?: MantineThemeOverride
    scheduleColorScheme?: MantineColorScheme
  }
}

const scheduleEl = document.getElementById("schedule")
if (scheduleEl) {
  const root = createRoot(scheduleEl)

  const theme = createTheme({ ...window.scheduleTheme })

  const app = <App theme={theme} colorScheme={window.scheduleColorScheme} />
  root.render(app)
}
