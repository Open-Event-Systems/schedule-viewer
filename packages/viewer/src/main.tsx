import { createRoot } from "react-dom/client"
import { App } from "./components/App.js"
import {
  createTheme,
  MantineColorScheme,
  MantineThemeOverride,
} from "@mantine/core"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-components/styles.scss"
import "./styles.scss"

declare global {
  var scheduleTheme: MantineThemeOverride | undefined
  var scheduleColorScheme: MantineColorScheme | undefined
}

const scheduleEl = document.getElementById("schedule")
if (scheduleEl) {
  const root = createRoot(scheduleEl)

  const theme = createTheme({ ...scheduleTheme })

  const app = <App theme={theme} colorScheme={scheduleColorScheme} />
  root.render(app)
}
