import { createRoot } from "react-dom/client"
import { App } from "./components/App.js"
import {
  createTheme,
  MantineColorScheme,
  MantineThemeOverride,
} from "@mantine/core"
import { SWStore, SWStoreContext } from "./service-worker.js"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-components/styles.scss"
import "@open-event-systems/schedule-map/styles.scss"
import "./styles.scss"

declare global {
  var scheduleTheme: MantineThemeOverride | undefined
  var scheduleColorScheme: MantineColorScheme | undefined
  var scheduleBasePath: string | undefined
  var scheduleServiceWorker: boolean | undefined
  var schedulePrecacheFiles: string[] | undefined
  var scheduleRouter: "hash" | "browser" | undefined
  var __webpack_public_path__: string | undefined
}

__webpack_public_path__ = scheduleBasePath ?? "/"

const scheduleEl = document.getElementById("schedule")
if (scheduleEl) {
  const root = createRoot(scheduleEl)
  const theme = createTheme({ ...scheduleTheme })

  const swStore = new SWStore()

  if (scheduleServiceWorker) {
    swStore.register(scheduleBasePath, schedulePrecacheFiles)
  }

  const app = (
    <SWStoreContext.Provider value={swStore}>
      <App
        routerType={scheduleRouter}
        basePath={scheduleBasePath}
        theme={theme}
        colorScheme={scheduleColorScheme}
      />
    </SWStoreContext.Provider>
  )
  root.render(app)
}
