import { hydrate } from "#src/ssr/hydrate.js"
import { useMantineColorScheme } from "@mantine/core"
import {
  defaultDehydrators,
  makeDehydrator,
} from "@open-event-systems/schedule-react/server"
import viteScripts from "@open-event-systems/schedule-react/vite-scripts"
import { dehydrate } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  createRoute,
  HeadContent,
  lazyRouteComponent,
  Outlet,
  Scripts,
  type AnyRouteMatch,
} from "@tanstack/react-router"
import { LoadingRoute } from "../components/loading/loading.js"
import type { RouterContext } from "../router.js"
import schedulePageRoutes from "./schedule-page.js"
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  head: ({
    match: {
      context: {
        appType,
        basePath,
        meta: ctxMeta,
        scripts: ctxScripts,
        links: ctxLinks,
      },
    },
  }) => {
    const meta: AnyRouteMatch["meta"] = [...(ctxMeta ?? [])]
    const links: AnyRouteMatch["links"] = [...(ctxLinks ?? [])]
    const scripts: AnyRouteMatch["scripts"] = [...(ctxScripts ?? [])]

    if (appType == "ssr") {
      if (import.meta.env.DEV) {
        scripts.push(...viteScripts)
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
    const { appType, queryClient, links, scripts, meta } =
      rootRoute.useRouteContext()
    const scheme = useMantineColorScheme()
    if (appType == "ssr") {
      let dehydratedData

      if (import.meta.env.SSR) {
        const dehydrator = makeDehydrator(hydrate, defaultDehydrators)
        dehydratedData = (
          <dehydrator.DehydratedData
            data={{
              queryClientData: dehydrate(queryClient),
              links: [...(links ?? [])],
              scripts: [...(scripts ?? [])],
              meta: [...(meta ?? [])],
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
  loader: async ({ context: { appContextPromise } }) => {
    await appContextPromise
  },
  component: lazyRouteComponent(
    () => import("../components/context/context.js"),
    "ContextRoute",
  ),
  pendingComponent: LoadingRoute,
  pendingMs: 0,
  pendingMinMs: 200,
})

export default rootRoute.addChildren([
  contextRoute.addChildren([schedulePageRoutes]),
])
