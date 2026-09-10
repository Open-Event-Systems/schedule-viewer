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
import { DehydrateData } from "../../ssr/dehydrate.js"
import { useMantineColorScheme } from "@mantine/core"
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  head: ({
    match: {
      context: { appType, basePath, scripts: ctxScripts, links: ctxLinks },
    },
  }) => {
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
    }

    return {
      scripts,
      links,
    }
  },
  component: () => {
    const { appType } = rootRoute.useRouteContext()
    const scheme = useMantineColorScheme()
    if (appType == "ssr") {
      let dehydrateQueryClient

      if (import.meta.env.SSR) {
        dehydrateQueryClient = <DehydrateData />
      }

      return (
        <html lang="en" data-mantine-color-scheme={scheme.colorScheme}>
          <head>
            <HeadContent />
          </head>
          <body>
            <Outlet />
            <Scripts />
            {dehydrateQueryClient}
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
