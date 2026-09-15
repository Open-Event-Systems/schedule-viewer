import { useMantineColorScheme } from "@mantine/core"
import { DehydratedData } from "@open-event-systems/schedule-react"
import { dehydrate } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  createRoute,
  HeadContent,
  Outlet,
  Scripts,
  type AnyRouteMatch,
} from "@tanstack/react-router"
import type { RouterContext } from "../router.js"
import { LoadingRoute } from "./components/loading/loading.js"
import schedulePageRoutes from "./schedule-page.js"
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  head: ({
    match: {
      context: { appType, basePath, scripts: ctxScripts, links: ctxLinks },
    },
  }) => {
    const meta: AnyRouteMatch["meta"] = []
    const links: AnyRouteMatch["links"] = [...(ctxLinks ?? [])]
    const scripts: AnyRouteMatch["scripts"] = [...(ctxScripts ?? [])]

    if (appType == "ssr") {
      if (import.meta.env.MODE != "production") {
        scripts.push({
          type: "module",
          children: `
  import RefreshRuntime from '/@react-refresh'
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true`,
        })
        scripts.push({
          type: "module",
          src: "/@vite/client",
        })
        scripts.push({
          type: "module",
          src: "/src/ssr/entry-client.tsx",
        })
      }

      scripts.push({
        src: `${basePath}config.js`,
      })

      meta.push({
        charSet: "utf-8",
      })

      meta.push({
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      })
    }

    return {
      scripts,
      links,
      meta,
    }
  },
  component: () => {
    const { appType, queryClient, links, scripts } = rootRoute.useRouteContext()
    const scheme = useMantineColorScheme()
    if (appType == "ssr") {
      let dehydratedData

      if (import.meta.env.SSR) {
        dehydratedData = (
          <DehydratedData
            data={{
              queryClientData: dehydrate(queryClient),
              links: [...(links ?? [])],
              scripts: [...(scripts ?? [])],
            }}
          />
        )
      }

      return (
        <html lang="en" data-mantine-color-scheme={scheme.colorScheme}>
          <head>
            <HeadContent />
          </head>
          <body>
            <Outlet />
            <Scripts />
            {dehydratedData}
          </body>
        </html>
      )
    } else {
      return (
        <>
          <HeadContent />
          <Outlet />
          <Scripts />
        </>
      )
    }
  },
})

export const contextRoute = createRoute({
  id: "loading",
  getParentRoute: () => rootRoute,
  beforeLoad: async ({ context: { appContextPromise } }) => {
    await appContextPromise
  },
  pendingComponent: LoadingRoute,
  pendingMs: 0,
  pendingMinMs: 200,
})

export default rootRoute.addChildren([
  contextRoute.addChildren([schedulePageRoutes]),
])
