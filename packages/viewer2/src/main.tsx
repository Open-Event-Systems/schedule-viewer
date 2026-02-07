import { createRoot } from "react-dom/client"
import { MantineProvider } from "@mantine/core"
import { App } from "./app.js"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"
import { SWStore, SWStoreContext } from "./service-worker.js"

const makeApp = (containerEl: Element) => {
  const root = createRoot(containerEl)
  const jsConfig = window.scheduleConfig
  const swStore = new SWStore()

  if ("serviceWorker" in window.navigator) {
    if (jsConfig?.serviceWorker) {
      swStore.register(jsConfig.basePath, jsConfig.cacheURLs)
    } else {
      swStore.unregister()
    }
  }

  const configURL = `${jsConfig?.basePath}/config.json`

  root.render(
    <MantineProvider
      theme={jsConfig?.theme}
      forceColorScheme={jsConfig?.colorScheme}
    >
      <SWStoreContext value={swStore}>
        <App
          configURL={configURL}
          history={jsConfig?.router}
          basePath={jsConfig?.basePath}
          swStore={swStore}
        />
      </SWStoreContext>
    </MantineProvider>,
  )
}

const containerEl = document.getElementById("schedule")
if (containerEl) {
  makeApp(containerEl)
}
