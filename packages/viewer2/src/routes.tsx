import {
  createRootRouteWithContext,
  createRoute,
  lazyRouteComponent,
  notFound,
  Outlet,
} from "@tanstack/react-router"
import type { RouterContext } from "./router.js"
import { Loading } from "./components/loading/loading.js"
import {
  isScheduleViewType,
  type ScheduleViewType,
} from "@open-event-systems/schedule-react"
import type { DetailedHTMLProps, LinkHTMLAttributes } from "react"
import { DedupedHeadContent } from "./components/head/deduped-head-content.js"

const dev = import.meta.env.DEV

import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

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
    "MainLayoutNotFound",
  ),
  errorComponent: lazyRouteComponent(
    () => import("./routes/main-layout.js"),
    "MainLayoutError",
  ),
  head({ match }) {
    if (match.status == "notFound") {
      return {
        meta: [{ title: "Not Found" }],
      }
    } else if (match.status == "error") {
      return {
        meta: [{ title: "Error" }],
      }
    }

    return {}
  },
})

export const scheduleProvidersRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "scheduleProviders",
  pendingComponent: Loading,
  async beforeLoad({ context: { contextPromise } }) {
    const { config } = await contextPromise
    return {
      pageTitle: config.title,
    }
  },
  component: lazyRouteComponent(
    () => import("./routes/providers.js"),
    "Providers",
  ),
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
    "NotFound",
  ),
  head({ match }) {
    if (match.status == "notFound") {
      return {
        meta: [{ title: "Not Found" }],
      }
    } else {
      return {}
    }
  },
})

export type PagesParams = Readonly<{
  view?: ScheduleViewType
  day?: string
  past?: boolean
  bookmarked?: boolean
}>

export const pagesRoute = createRoute({
  getParentRoute: () => filterStateRoute,
  path: "/{-$pageId}",
  validateSearch: (search: Record<string, unknown>): PagesParams => {
    const viewType = search.view
    const day = search.day
    const past = !!search.past
    const bookmarked = !!search.bookmarked

    return {
      ...(isScheduleViewType(viewType) ? { view: viewType } : {}),
      ...(typeof day == "string" ? { day } : {}),
      ...(past ? { past: true } : {}),
      ...(bookmarked ? { bookmarked: true } : {}),
    }
  },
  search: {
    middlewares: [
      ({ search, next }) => {
        const { past, bookmarked, ...other } = next(search)

        return {
          ...other,
          ...(past ? { past: true } : {}),
          ...(bookmarked ? { bookmarked: true } : {}),
        }
      },
    ],
  },
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
    const { queryClient, config, scheduleAPI, selectionsAPI } = context

    const { itemQueryOptions, selectionsQueryOptions, parsers } =
      await loadQueryOptions()

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    // only await selections if viewing the bookmarked mode
    const selectionsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.sessionSelections(
        selectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    queryClient.fetchQuery(
      selectionsQueryOptions.bookmarkCounts(selectionsAPI, config.id),
    )

    const [items] = await Promise.all([
      itemsPromise,
      bookmarked ? selectionsPromise : undefined,
    ])

    return { items }
  },
  head: ({
    match: {
      context: { config, pageConfig, defaultPageCanonicalHref },
    },
    params: { pageId },
  }) => {
    const scheduleTitle = config.title
    const pageTitle = pageConfig.title || "Schedule"
    const links: DetailedHTMLProps<
      LinkHTMLAttributes<HTMLLinkElement>,
      HTMLLinkElement
    >[] = []

    // add canonical rel if accessing the default page (browser routing only)
    if (!pageId && defaultPageCanonicalHref) {
      links.push({ rel: "canonical", href: defaultPageCanonicalHref })
    }

    return {
      meta: [{ title: `${pageTitle} - ${scheduleTitle}` }],
      links,
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
    const { config, queryClient, scheduleAPI, selectionsAPI } = context

    const { itemQueryOptions, selectionsQueryOptions, parsers } =
      await loadQueryOptions()

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    // selections/counts dont need to be awaited now
    queryClient.fetchQuery(
      selectionsQueryOptions.sessionSelections(
        selectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    queryClient.fetchQuery(
      selectionsQueryOptions.bookmarkCounts(selectionsAPI, config.id),
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
    return {
      meta: [
        { title: `${eventTitle} - ${scheduleTitle}` },
        ...(loaderData?.event.description
          ? [
              {
                name: "description",
                content: loaderData?.event.description,
              },
            ]
          : []),
      ],
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
    "MainLayoutNotFound",
  ),
  head: ({ match }) => {
    if (match.status == "notFound") {
      return {
        meta: [{ title: "Not Found" }],
      }
    } else {
      return {}
    }
  },
})

export type MapParams = Readonly<{
  show?: string
  loc?: string
  level?: string
  iso?: boolean
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
    return {
      ...(typeof show == "string" && show ? { show } : {}),
      ...(typeof loc == "string" && loc ? { loc } : {}),
      ...(typeof level == "string" && level ? { level } : {}),
      ...(iso ? { iso: true } : {}),
    }
  },
  search: {
    middlewares: [
      ({ search, next }) => {
        const { iso, ...other } = next(search)

        return {
          ...other,
          ...(iso ? { iso: true } : {}),
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
    const { config, queryClient, scheduleAPI, selectionsAPI } = context

    const { itemQueryOptions, selectionsQueryOptions, parsers } =
      await loadQueryOptions()

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    // dont need to await selections/counts
    queryClient.fetchQuery(
      selectionsQueryOptions.sessionSelections(
        selectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    queryClient.fetchQuery(
      selectionsQueryOptions.bookmarkCounts(selectionsAPI, config.id),
    )

    const [
      {
        byType: { event: events, vendor: vendors },
      },
    ] = await Promise.all([itemsPromise])

    return {
      events,
      vendors,
    }
  },
  component: lazyRouteComponent(() => import("./routes/map.js"), "MapRoute"),
  head: ({
    match: {
      context: { config },
    },
  }) => {
    const scheduleTitle = config.title
    return {
      meta: [{ title: `Map - ${scheduleTitle}` }],
    }
  },
})

const loadQueryOptions = async () => {
  const [{ itemQueryOptions, selectionsQueryOptions }, { parsers }] =
    await Promise.all([
      import("@open-event-systems/schedule-react").then(
        ({ itemQueryOptions, selectionsQueryOptions }) => ({
          itemQueryOptions,
          selectionsQueryOptions,
        }),
      ),
      import("./schedule.js").then(({ parsers }) => ({ parsers })),
    ])

  return { itemQueryOptions, selectionsQueryOptions, parsers }
}
