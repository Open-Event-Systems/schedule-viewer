/**
 * Main react component for the SPA.
 */

import {
  createBrowserHistory,
  createHashHistory,
  RouterProvider,
} from "@tanstack/react-router"
import { MantineProvider } from "@mantine/core"
import type { SPAConfig } from "./config.js"
import {
  getHeadElements,
  InitialHeadContext,
} from "../components/head/deduped-head.js"
import { makeRouter } from "../router.js"
import { useState } from "react"

export const App = ({ spaConfig }: { spaConfig: SPAConfig }) => {
  const [{ initialHeadElements, router }] = useState(() => {
    const contextPromise = import("./setup.js").then(({ setup }) =>
      setup(spaConfig),
    )
    let history

    if (spaConfig.router == "browser") {
      history = createBrowserHistory()
    } else {
      history = createHashHistory()
    }

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
