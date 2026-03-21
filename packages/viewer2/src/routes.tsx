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

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component() {
    return (
      <>
        <DedupedHeadContent />
        <Outlet />
      </>
    )
  },
})

export const scheduleSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "scheduleSetup",
  async beforeLoad({ context }) {
    const { setupPromise } = context
    const setup = await setupPromise
    return {
      ...setup,
    }
  },
  component: lazyRouteComponent(
    () => import("./routes/setup.js"),
    "ScheduleSetupRoute",
  ),
  pendingMs: 0,
  pendingComponent: Loading,
})

export const scheduleLayoutRoute = createRoute({
  getParentRoute: () => scheduleSetupRoute,
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
  async beforeLoad({ context: { config }, params: { pageId }, buildLocation }) {
    const pageConfig = pageId
      ? config.pages.find((p) => p.id == pageId)
      : config.pages[0]

    if (!pageConfig) {
      throw notFound()
    }

    const getCanonicalHref = () =>
      origin +
      buildLocation({
        to: pagesRoute.to,
        params: {
          pageId: pageConfig.id,
        },
      }).href

    return {
      pageConfig,
      getCanonicalHref,
    }
  },
  async loader({ context }) {
    const { queryClient, config, scheduleAPI, selectionsAPI } = context
    const { itemQueryOptions, selectionsQueryOptions, parsers } = await import(
      "./route-loaders.js"
    )

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    const selectionsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.sessionSelections(
        selectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    const countsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.bookmarkCounts(selectionsAPI, config.id),
    )

    const [items, selections, counts] = await Promise.all([
      itemsPromise,
      selectionsPromise,
      countsPromise,
    ])

    return { items, selections, counts }
  },
  head: ({
    match: {
      context: { config, pageConfig, getCanonicalHref, routerType },
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
    if (!pageId && routerType == "browser") {
      links.push({ rel: "canonical", href: getCanonicalHref() })
    }

    return {
      meta: [
        { title: `${pageTitle} - ${scheduleTitle}` },
        { name: "description", content: "TEST" },
      ],
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

    const { itemQueryOptions, selectionsQueryOptions, parsers } = await import(
      "./route-loaders.js"
    )

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    const selectionsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.sessionSelections(
        selectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    const countsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.bookmarkCounts(selectionsAPI, config.id),
    )

    const [
      {
        byType: { event: events },
      },
      selections,
      counts,
    ] = await Promise.all([itemsPromise, selectionsPromise, countsPromise])

    const event = events.find((e) => e.id == eventId)
    if (!event) {
      throw notFound()
    }

    return {
      event,
      selections,
      counts,
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

export const mapSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "mapSetup",
  async beforeLoad({ context }) {
    const { setupPromise } = context
    const setup = await setupPromise
    return {
      ...setup,
    }
  },
  component: lazyRouteComponent(
    () => import("./routes/setup.js"),
    "MapSetupRoute",
  ),
  pendingMs: 0,
  pendingComponent: Loading,
})

export type MapParams = Readonly<{
  show?: string
  loc?: string
  level?: string
  iso?: boolean
}>

export const mapRoute = createRoute({
  getParentRoute: () => mapSetupRoute, // TODO
  path: "/map",
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
  async loader({ context }) {
    const { config, queryClient, scheduleAPI, selectionsAPI } = context

    const { itemQueryOptions, selectionsQueryOptions, parsers } = await import(
      "./route-loaders.js"
    )

    const itemsPromise = queryClient.fetchQuery(
      itemQueryOptions.items(scheduleAPI, config.id, parsers),
    )

    const selectionsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.sessionSelections(
        selectionsAPI,
        config.id,
        "bookmarks",
      ),
    )

    const countsPromise = queryClient.fetchQuery(
      selectionsQueryOptions.bookmarkCounts(selectionsAPI, config.id),
    )

    const [
      {
        byType: { event: events, vendor: vendors },
      },
      selections,
      counts,
    ] = await Promise.all([itemsPromise, selectionsPromise, countsPromise])

    return {
      events,
      vendors,
      selections,
      counts,
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
