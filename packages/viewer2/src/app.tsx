import { Suspense, useState } from "react"
import { makeRouter } from "./router.js"
import { RouterProvider } from "@tanstack/react-router"
import type { ScheduleJSConfig } from "./global-config.js"
import {
  getHeaderElements,
  InitialHeadContext,
} from "./components/head/deduped-head.js"

export const App = ({ jsConfig }: { jsConfig?: ScheduleJSConfig }) => {
  const [{ router, initialHeadElements }] = useState(() => {
    const setupPromise = import("./setup.js").then(({ setup }) =>
      setup(jsConfig),
    )

    // refetch data after SW install to get it in the runtime cache
    setupPromise.then(async (result) => {
      const { swStore } = result
      await swStore.firstInstall
      const { cacheData } = await import("./setup.js")
      console.info("Refetching data for cache")
      return cacheData(result)
    })

    return {
      router: makeRouter(
        setupPromise,
        window.origin,
        jsConfig?.router,
        jsConfig?.basePath,
      ),
      initialHeadElements: getHeaderElements(),
    }
  })
  return (
    <Suspense fallback={<>FALLBACK</>}>
      <InitialHeadContext value={initialHeadElements}>
        <RouterProvider router={router} />
      </InitialHeadContext>
    </Suspense>
  )
}
