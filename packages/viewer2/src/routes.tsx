import {
  createRootRouteWithContext,
  createRoute,
  lazyRouteComponent,
  notFound,
  Outlet,
} from "@tanstack/react-router"
import type { RouterContext } from "./router.js"
import { Loading } from "./components/loading/loading.js"
import type { MetaHTMLAttributes } from "react"
import { DedupedHeadContent } from "./components/head/deduped-head-content.js"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { getQueryOptions } from "./loaders.js"

const dev = import.meta.env.DEV

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  pendingComponent: Loading,
  pendingMs: 0,
  component() {
    const { queryClient } = rootRoute.useRouteContext()
    return (
      <>
        <DedupedHeadContent />
        <Outlet />
        {dev && <TanStackRouterDevtools />}
        {dev && queryClient && <ReactQueryDevtools client={queryClient} />}
      </>
    )
  },
  notFoundComponent: lazyRouteComponent(
    () => import("./routes/main-layout.js"),
    "MainLayoutRouteNotFound",
  ),
  errorComponent: lazyRouteComponent(
    () => import("./routes/main-layout.js"),
    "MainLayoutRouteError",
  ),
  head({ match }) {
    if (match.status == "notFound") {
      return {
        meta: [{ title: "Not Found" }, { name: "robots", content: "noindex" }],
      }
    } else if (match.status == "error") {
      return {
        meta: [{ title: "Error" }, { name: "robots", content: "noindex" }],
      }
    }

    return {
      meta: [{ property: "og:type", content: "article" }],
    }
  },
})

export type PagesParams = Readonly<{
  view?: string
  day?: string
  past?: boolean
  bookmarked?: boolean
  unvisited?: boolean
}>

export const scheduleProvidersRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "scheduleProviders",
  pendingComponent: Loading,
  validateSearch: (search): PagesParams => {
    const {
      view: viewVal,
      day: dayVal,
      past: pastVal,
      bookmarked: bookmarkedVal,
      unvisited: unvisitedVal,
    } = search

    const view = typeof viewVal == "string" && viewVal ? viewVal : ""
    const day = typeof dayVal == "string" && dayVal ? dayVal : ""
    const past = pastVal == "true"
    const bookmarked = bookmarkedVal == "true"
    const unvisited = unvisitedVal == "true"

    return {
      ...(view ? { view } : {}),
      ...(day ? { day } : {}),
      ...(past ? { past } : {}),
      ...(bookmarked ? { bookmarked } : {}),
      ...(unvisited ? { unvisited } : {}),
    }
  },
  search: {
    middlewares: [
      ({ search, next }) => {
        const { past, bookmarked, unvisited, ...other } = next(search)

        return {
          ...other,
          ...(past ? { past: true } : {}),
          ...(bookmarked ? { bookmarked: true } : {}),
          ...(unvisited ? { unvisited: true } : {}),
        }
      },
    ],
  },
  async beforeLoad({ context: { contextPromise } }) {
    await contextPromise
  },
  component: lazyRouteComponent(
    () => import("./routes/providers.js"),
    "Providers",
  ),
  head: ({
    match: {
      context: { config },
    },
  }) => {
    const metaAttrs: MetaHTMLAttributes<HTMLMetaElement>[] = []

    if (config.title) {
      metaAttrs.push({ property: "og:site_name", content: config.title })
    }

    return {
      meta: metaAttrs,
    }
  },
})

export const scheduleLayoutRoute = createRoute({
  getParentRoute: () => scheduleProvidersRoute,
  id: "scheduleLayout",
  component: lazyRouteComponent(
    () => import("./routes/main-layout.js"),
    "MainLayoutRoute",
  ),
})

export const filterStateRoute = createRoute({
  getParentRoute: () => scheduleLayoutRoute,
  id: "filterState",
  component: lazyRouteComponent(
    () => import("./routes/filter-state.js"),
    "FilterStateRoute",
  ),
  notFoundComponent: lazyRouteComponent(
    () => import("./routes/main-layout.js"),
    "MainLayoutRouteNotFoundMessage",
  ),
  head({ match }) {
    if (match.status == "notFound") {
      return {
        meta: [{ title: "Not Found" }, { name: "robots", content: "noindex" }],
      }
    } else {
      return {}
    }
  },
})

export const pagesRoute = createRoute({
  getParentRoute: () => filterStateRoute,
  path: "/{-$pageId}",
  component: lazyRouteComponent(
    () => import("./routes/pages.js"),
    "PagesRoute",
  ),
  async beforeLoad({ context: { config }, params: { pageId } }) {
    const pageConfig = pageId
      ? config.pages.find((p) => p.id == pageId)
      : config.pages[0]

    if (!pageConfig) {
      throw notFound()
    }

    return {
      pageConfig,
    }
  },
  loaderDeps: ({ search: { bookmarked } }) => ({ bookmarked }),
  async loader({ context, deps: { bookmarked } }) {
    const {
      queryClient,
      config,
      scheduleAPI,
      selectionsServiceAPI,
      sessionSelectionsAPIs: { bookmarks: bookmarksSessionSelectionsAPI },
    } = context

    const {
      itemQueryOptions,
      selectionsQueryOptions,
      sessionSelectionsQueryOptions,
      parsers,
    } = await getQueryOptions()

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    // only await selections if viewing the bookmarked mode
    const bookmarksPromise = queryClient.fetchQuery(
      sessionSelectionsQueryOptions.sessionSelections(
        bookmarksSessionSelectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    const visitedPromise = queryClient.fetchQuery(
      sessionSelectionsQueryOptions.sessionSelections(
        bookmarksSessionSelectionsAPI,
        config.id,
        "visited",
      ),
    )

    queryClient.fetchQuery(
      selectionsQueryOptions.counts(
        selectionsServiceAPI,
        config.id,
        "bookmarks",
      ),
    )

    await Promise.all([
      itemsPromise,
      bookmarked ? bookmarksPromise : undefined,
      bookmarked ? visitedPromise : undefined,
    ])
  },
  head: ({
    match: {
      context: { config, pageConfig },
    },
  }) => {
    const scheduleTitle = config.title
    const pageTitle = pageConfig.title || "Schedule"
    const metaAttrs: MetaHTMLAttributes<HTMLMetaElement>[] = [
      { title: `${pageTitle} - ${scheduleTitle}` },
      { property: "og:title", content: pageTitle },
    ]

    if (pageConfig.description) {
      metaAttrs.push({
        property: "og:description",
        content: pageConfig.description,
      })
      metaAttrs.push({
        name: "description",
        content: pageConfig.description,
      })
    }

    return {
      meta: metaAttrs,
    }
  },
})

export const sharedPagesRoute = createRoute({
  getParentRoute: () => filterStateRoute,
  path: "/shared/$shareId/{-$pageId}",
  component: lazyRouteComponent(() => import("./routes/shared-pages.js")),
  async beforeLoad({ context: { config }, params: { pageId } }) {
    const pageConfig = pageId
      ? config.pages.find((p) => p.id == pageId)
      : config.pages[0]

    if (!pageConfig) {
      throw notFound()
    }

    return {
      pageConfig,
    }
  },
  loaderDeps: ({ search: { bookmarked } }) => ({ bookmarked }),
  async loader({ context, params: { shareId }, deps: { bookmarked } }) {
    const {
      queryClient,
      config,
      scheduleAPI,
      selectionsServiceAPI,
      sessionSelectionsAPIs: { bookmarks: bookmarksSessionSelectionsAPI },
    } = context

    const {
      itemQueryOptions,
      selectionsQueryOptions,
      sessionSelectionsQueryOptions,
      parsers,
    } = await getQueryOptions()

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    // only await selections if viewing the bookmarked mode
    const bookmarksPromise = queryClient.fetchQuery(
      sessionSelectionsQueryOptions.sessionSelections(
        bookmarksSessionSelectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    const visitedPromise = queryClient.fetchQuery(
      sessionSelectionsQueryOptions.sessionSelections(
        bookmarksSessionSelectionsAPI,
        config.id,
        "visited",
      ),
    )

    queryClient.fetchQuery(
      selectionsQueryOptions.counts(
        selectionsServiceAPI,
        config.id,
        "bookmarks",
      ),
    )

    // load shared selections
    const sharedSelectionsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.selections(
        selectionsServiceAPI,
        config.id,
        shareId,
      ),
    )

    const [sharedSelections] = await Promise.all([
      sharedSelectionsPromise,
      itemsPromise,
      bookmarked ? bookmarksPromise : undefined,
      bookmarked ? visitedPromise : undefined,
    ])

    if (!sharedSelections) {
      throw notFound()
    }
  },
  head: ({
    match: {
      context: { config, pageConfig },
    },
  }) => {
    const scheduleTitle = config.title
    const pageTitle = pageConfig.title || "Schedule"
    const metaAttrs: MetaHTMLAttributes<HTMLMetaElement>[] = [
      { title: `Shared Schedule - ${pageTitle} - ${scheduleTitle}` },
      { property: "og:title", content: `Shared Schedule - ${pageTitle}` },
    ]

    if (pageConfig.description) {
      metaAttrs.push({
        property: "og:description",
        content: pageConfig.description,
      })
      metaAttrs.push({
        name: "description",
        content: pageConfig.description,
      })
    }

    return {
      meta: metaAttrs,
    }
  },
})

export const syncRoute = createRoute({
  path: "/sync",
  getParentRoute: () => rootRoute,
  beforeLoad: async ({ context: { contextPromise } }) => {
    await contextPromise
    return { pageTitle: "Sync Schedule" }
  },
  component: lazyRouteComponent(() => import("./routes/sync.js")),
  head: () => {
    return {
      meta: [{ title: "Sync Schedule" }],
    }
  },
})

export const eventDetailsRoute = createRoute({
  getParentRoute: () => filterStateRoute,
  path: "/events/$eventId",
  component: lazyRouteComponent(
    () => import("./routes/details.js"),
    "EventDetailsRoute",
  ),
  async loader({ params, context }) {
    const { eventId } = params
    const {
      config,
      queryClient,
      scheduleAPI,
      selectionsServiceAPI,
      sessionSelectionsAPIs: { bookmarks: bookmarksSessionSelectionsAPI },
    } = context

    const {
      itemQueryOptions,
      selectionsQueryOptions,
      sessionSelectionsQueryOptions,
      parsers,
    } = await getQueryOptions()

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    // selections/counts dont need to be awaited now
    queryClient.fetchQuery(
      sessionSelectionsQueryOptions.sessionSelections(
        bookmarksSessionSelectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    queryClient.fetchQuery(
      selectionsQueryOptions.counts(
        selectionsServiceAPI,
        config.id,
        "bookmarks",
      ),
    )

    const [
      {
        byType: { event: events },
      },
    ] = await Promise.all([itemsPromise])

    const event = events.find((e) => e.id == eventId)
    if (!event) {
      throw notFound()
    }

    return {
      event,
    }
  },
  head: ({
    match: {
      context: { config },
    },
    loaderData,
  }) => {
    const eventTitle = loaderData?.event.title || "Event Details"
    const scheduleTitle = config.title

    const metaAttrs: MetaHTMLAttributes<HTMLMetaElement>[] = [
      { title: `${eventTitle} - ${scheduleTitle}` },
      { property: "og:title", content: eventTitle },
    ]

    if (loaderData?.event.description) {
      metaAttrs.push({
        name: "description",
        content: loaderData.event.description,
      })
      metaAttrs.push({
        name: "og:description",
        content: loaderData.event.description,
      })
    }

    // TODO: icon/image?

    return {
      meta: metaAttrs,
    }
  },
})

export const vendorDetailsRoute = createRoute({
  getParentRoute: () => filterStateRoute,
  path: "/vendors/$vendorId",
  component: lazyRouteComponent(
    () => import("./routes/details.js"),
    "VendorDetailsRoute",
  ),
  async loader({ params, context }) {
    const { vendorId } = params
    const {
      config,
      queryClient,
      scheduleAPI,
      selectionsServiceAPI,
      sessionSelectionsAPIs: { bookmarks: bookmarksSessionSelectionsAPI },
    } = context

    const {
      itemQueryOptions,
      selectionsQueryOptions,
      sessionSelectionsQueryOptions,
      parsers,
    } = await getQueryOptions()

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    // selections/counts dont need to be awaited now
    queryClient.fetchQuery(
      sessionSelectionsQueryOptions.sessionSelections(
        bookmarksSessionSelectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    queryClient.fetchQuery(
      selectionsQueryOptions.counts(
        selectionsServiceAPI,
        config.id,
        "bookmarks",
      ),
    )

    const [
      {
        byType: { vendor: vendors },
      },
    ] = await Promise.all([itemsPromise])

    const vendor = vendors.find((e) => e.id == vendorId)
    if (!vendor) {
      throw notFound()
    }

    return {
      vendor,
    }
  },
  head: ({
    match: {
      context: { config },
    },
    loaderData,
  }) => {
    const vendorTitle = loaderData?.vendor.title || "Vendor Details"
    const scheduleTitle = config.title

    const metaAttrs: MetaHTMLAttributes<HTMLMetaElement>[] = [
      { title: `${vendorTitle} - ${scheduleTitle}` },
      { property: "og:title", content: vendorTitle },
    ]

    if (loaderData?.vendor.description) {
      metaAttrs.push({
        name: "description",
        content: loaderData.vendor.description,
      })
      metaAttrs.push({
        name: "og:description",
        content: loaderData.vendor.description,
      })
    }

    // TODO: icon/image?

    return {
      meta: metaAttrs,
    }
  },
})

export const mapProvidersRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "mapProviders",
  async beforeLoad({ context: { contextPromise } }) {
    await contextPromise
  },
  component: lazyRouteComponent(
    () => import("./routes/providers.js"),
    "Providers",
  ),
  notFoundComponent: lazyRouteComponent(
    () => import("./routes/main-layout.js"),
    "MainLayoutRouteNotFound",
  ),
  head: ({ match }) => {
    if (match.status == "notFound") {
      return {
        meta: [{ title: "Not Found" }, { name: "robots", content: "noindex" }],
      }
    }

    const config = match.context.config

    const metaAttrs: MetaHTMLAttributes<HTMLMetaElement>[] = []

    if (config.title) {
      metaAttrs.push({ property: "og:site_name", content: config.title })
    }

    return {
      meta: metaAttrs,
    }
  },
})

export type MapParams = Readonly<{
  show?: string
  loc?: string
  level?: string
  iso?: boolean
  flag?: readonly string[]
}>

export const mapRoute = createRoute({
  getParentRoute: () => mapProvidersRoute, // TODO
  path: "/map",
  pendingComponent: Loading,
  validateSearch: (params: Record<string, unknown>): MapParams => {
    const show = params.show
    const loc = params.loc
    const level = params.level
    const iso = params.iso
    const flags = Array.isArray(params.flag)
      ? params.flag
      : typeof params.flag == "string"
        ? [params.flag]
        : []
    return {
      ...(typeof show == "string" && show ? { show } : {}),
      ...(typeof loc == "string" && loc ? { loc } : {}),
      ...(typeof level == "string" && level ? { level } : {}),
      ...(iso ? { iso: true } : {}),
      flag: flags,
    }
  },
  search: {
    middlewares: [
      ({ search, next }) => {
        const { iso, flag, ...other } = next(search)

        return {
          ...other,
          ...(iso ? { iso: true } : {}),
          ...(flag && flag.length > 0 && { flag }),
        }
      },
    ],
  },
  async beforeLoad({ context: { config } }) {
    if (!config.map) {
      throw notFound()
    }
  },
  async loader({ context }) {
    const {
      config,
      queryClient,
      scheduleAPI,
      selectionsServiceAPI,
      sessionSelectionsAPIs: { bookmarks: bookmarksSessionSelectionsAPI },
    } = context

    const {
      itemQueryOptions,
      selectionsQueryOptions,
      sessionSelectionsQueryOptions,
      parsers,
    } = await getQueryOptions()

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    // dont need to await selections/counts
    queryClient.fetchQuery(
      sessionSelectionsQueryOptions.sessionSelections(
        bookmarksSessionSelectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    queryClient.fetchQuery(
      sessionSelectionsQueryOptions.sessionSelections(
        bookmarksSessionSelectionsAPI,
        config.id,
        "visited",
      ),
    )

    queryClient.fetchQuery(
      selectionsQueryOptions.counts(
        selectionsServiceAPI,
        config.id,
        "bookmarks",
      ),
    )

    await Promise.all([itemsPromise])
  },
  component: lazyRouteComponent(() => import("./routes/map.js"), "MapRoute"),
  head: ({
    match: {
      context: { config },
    },
  }) => {
    const scheduleTitle = config.title
    return {
      meta: [
        { title: `Map - ${scheduleTitle}` },
        { property: "og:title", content: "Map" },
        {
          name: "description",
          content: "Explore the interactive map of the event",
        },
        {
          property: "og:description",
          content: "Explore the interactive map of the event",
        },
      ],
    }
  },
})
