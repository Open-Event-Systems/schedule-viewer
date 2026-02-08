import { Suspense, useState } from "react"
import { makeRouter } from "./router.js"
import { RouterProvider } from "@tanstack/react-router"
import type { ScheduleJSConfig } from "./global-config.js"

export const App = ({ jsConfig }: { jsConfig?: ScheduleJSConfig }) => {
  const [{ router }] = useState(() => {
    const setupPromise = import("./setup.js").then(({ setup }) =>
      setup(jsConfig),
    )

    // refetch data after SW install to get it in the runtime cache
    setupPromise.then(async (result) => {
      const { swStore } = result
      await swStore.firstReady
      const { cacheData } = await import("./setup.js")
      console.info("Refetching data for cache")
      return cacheData(result)
    })

    return {
      router: makeRouter(
        {
          setupPromise,
        },
        jsConfig?.router,
      ),
    }
  })
  return (
    <Suspense fallback={<>FALLBACK</>}>
      <RouterProvider
        router={router}
        basepath={jsConfig?.router == "browser" ? jsConfig.basePath : undefined}
      />
    </Suspense>
  )
}
