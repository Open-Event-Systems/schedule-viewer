import {
  createLink,
  notFound,
  useLocation,
  useRouter,
} from "@tanstack/react-router"
import { useViewerConfig } from "../config.js"
import {
  eventDetailsRoute,
  filterStateRoute,
  pagesRoute,
  rootRoute,
  vendorDetailsRoute,
} from "../routes.js"
import { Anchor, Stack } from "@mantine/core"
import { useMemo, useState } from "react"
import type { DetailedScheduleItem } from "@open-event-systems/schedule-lib"
import {
  makeItemNavPropsMap,
  makeItemsByIdMap,
  makeRenderItemDetailsFunc,
  parsers,
} from "../schedule.js"
import { makeMapLocationMatchFunc } from "@open-event-systems/schedule-map"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  getItemDetailsProps,
  itemQueryOptions,
  useScheduleAPI,
} from "@open-event-systems/schedule-react"
import { JSONLDEvent } from "../components/ld/ld.js"

declare module "@tanstack/react-router" {
  interface HistoryState {
    backURL?: string
  }
}

export const EventDetailsRoute = () => {
  const api = useScheduleAPI()

  const { eventId } = eventDetailsRoute.useParams()
  const config = useViewerConfig()
  const event = useSuspenseQuery({
    ...itemQueryOptions.items(api, config.id, parsers),
    select(items) {
      return items.byType.event.filter((e) => e.id == eventId)
    },
  })

  const router = useRouter()

  const url =
    router.origin +
    router.history.createHref(
      router.buildLocation({
        to: ".",
        params: true,
      }).href,
    )

  if (!event.data || event.data.length == 0) {
    throw notFound({ routeId: filterStateRoute.id })
  }

  return (
    <>
      <JSONLDEvent event={event.data[0]!} url={url} />
      <ItemDetails items={event.data} />
    </>
  )
}

export const VendorDetailsRoute = () => {
  const api = useScheduleAPI()

  const { vendorId } = vendorDetailsRoute.useParams()
  const config = useViewerConfig()
  const vendor = useSuspenseQuery({
    ...itemQueryOptions.items(api, config.id, parsers),
    select(items) {
      return items.byType.vendor.filter((e) => e.id == vendorId)
    },
  })

  const router = useRouter()

  const url =
    router.origin +
    router.history.createHref(
      router.buildLocation({
        to: ".",
        params: true,
      }).href,
    )


  if (!vendor.data || vendor.data.length == 0) {
    throw notFound({ routeId: filterStateRoute.id })
  }

  return (
    <>
      <JSONLDEvent event={vendor.data[0]!} url={url} />
      <ItemDetails items={vendor.data} />
    </>
  )
}

export const ItemDetails = ({
  items,
}: {
  items: readonly DetailedScheduleItem[]
}) => {
  const config = useViewerConfig()

  const router = useRouter()
  const { getCurrentURL } = rootRoute.useRouteContext()
  const loc = useLocation()

  // hacky way to hold on to the initial back url
  const [backURL] = useState(() => loc.state.backURL)

  const locMatchFunc = useMemo(
    () => makeMapLocationMatchFunc(config.map?.locations ?? []),
    [config.map?.locations],
  )

  const navPropsMap = useMemo(
    () => makeItemNavPropsMap(router, getCurrentURL, locMatchFunc, items),
    [router, router.origin, getCurrentURL, locMatchFunc, items],
  )
  const itemsByIdMap = useMemo(() => makeItemsByIdMap(items), [items])
  const renderItemDetailsFunc = useMemo(
    () => makeRenderItemDetailsFunc(navPropsMap, itemsByIdMap),
    [navPropsMap, itemsByIdMap],
  )

  const details = renderItemDetailsFunc({
    ...getItemDetailsProps(items[0]!),
    large: true,
    buttonOptions: ["share", "bookmark"],
  })

  return (
    <>
      <Stack>
        {backURL ? (
          <Anchor
            href={backURL}
            onClick={(e) => {
              e.preventDefault()
              router.history.go(-1)
            }}
            size="sm"
          >
            &laquo; Back to schedule
          </Anchor>
        ) : (
          <ALink to={pagesRoute.to} size="sm">
            &laquo; View full schedule
          </ALink>
        )}
        {details}
      </Stack>
    </>
  )
}

const ALink = createLink(Anchor<"a">)
