import { createRoot } from "react-dom/client"
import { App } from "./components/App.js"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-components/styles.scss"
import { RequiredScheduleConfig } from "@open-event-systems/schedule-lib"
import { MantineColorScheme, MantineThemeOverride } from "@mantine/core"

declare global {
  interface Window {
    scheduleConfig: RequiredScheduleConfig
    scheduleTheme?: MantineThemeOverride
    scheduleColorScheme?: MantineColorScheme
  }
}

if ("serviceWorker" in navigator) {
  import("workbox-window").then(({ Workbox }) => {
    const workbox = new Workbox("sw.js")
    workbox.addEventListener("activated", (ev) => {
      // cache the config files on activation
      workbox
        .messageSW({
          type: "CACHE_URLS",
          payload: { urlsToCache: ["config.js", "theme.js", "custom.css"] },
        })
        .then(() => {
          // reload if the worker updated
          if (ev.isUpdate) {
            window.location.reload()
          }
        })
    })
    workbox.register()
  })
}

const scheduleEl = document.getElementById("schedule")
if (scheduleEl && window.scheduleConfig) {
  const root = createRoot(scheduleEl)

  const app = (
    <App
      config={window.scheduleConfig}
      theme={window.scheduleTheme}
      colorScheme={window.scheduleColorScheme}
    />
  )
  root.render(app)
}
