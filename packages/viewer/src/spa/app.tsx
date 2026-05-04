/**
 * Main react component for the SPA.
 */

import {
  createBrowserHistory,
  createHashHistory,
  RouterProvider,
} from "@tanstack/react-router"
import { MantineProvider } from "@mantine/core"
import { getSPAConfig } from "./config.js"
import {
  getHeadElements,
  InitialHeadContext,
} from "../components/head/deduped-head.js"
import { makeRouter } from "../router.js"
import { useState } from "react"
import { cacheData } from "../setup.js"
import { makePWAStore } from "../sw/pwa.js"
import { setupUmami } from "../umami.js"

// singleton
const pwaStore = makePWAStore()

export const App = () => {
  const spaConfig = getSPAConfig()

  const [{ initialHeadElements, router }] = useState(() => {
    const contextPromise = import("./setup.js")
      .then(({ setup }) => setup(spaConfig, pwaStore))
      .then((ctx) => {
        // re-fetch data to populate the runtime cache
        ctx.swStore.getState().firstInstallPromise.then(() => {
          cacheData(ctx)
        })

        return ctx
      })
    let history

    if (spaConfig.router == "browser") {
      history = createBrowserHistory()
    } else {
      history = createHashHistory()
    }

    // setup analytics
    setupUmami()

    return {
      initialHeadElements: getHeadElements(),
      router: makeRouter(
        contextPromise,
        window.origin,
        spaConfig.router == "browser" ? spaConfig.basePath : "",
        history,
      ),
    }
  })

  return (
    <MantineProvider
      theme={spaConfig.theme}
      forceColorScheme={spaConfig.colorScheme}
    >
      <InitialHeadContext value={initialHeadElements}>
        <RouterProvider router={router} />
      </InitialHeadContext>
    </MantineProvider>
  )
}
