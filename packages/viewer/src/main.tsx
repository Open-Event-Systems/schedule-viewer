import { createRoot } from "react-dom/client"
import { App } from "./App.js"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-components/styles.scss"
import { MantineColorScheme, MantineThemeOverride } from "@mantine/core"

document.addEventListener("DOMContentLoaded", () => {
  const scheduleEl = document.querySelector("[data-schedule]")
  if (scheduleEl) {
    const root = createRoot(scheduleEl)

    const themeStr = scheduleEl.getAttribute("data-theme")
    let theme: MantineThemeOverride = {}
    if (themeStr) {
      try {
        theme = JSON.parse(themeStr)
      } catch (_) {}
    }

    const app = (
      <App
        configURL={scheduleEl.getAttribute("data-schedule") ?? ""}
        colorScheme={
          (scheduleEl.getAttribute("data-color-scheme") || undefined) as
            | MantineColorScheme
            | undefined
        }
        theme={theme}
      />
    )
    root.render(app)
  }
})
