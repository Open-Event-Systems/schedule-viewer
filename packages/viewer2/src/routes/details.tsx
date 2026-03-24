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
} from "../routes.js"
import { Anchor, Stack } from "@mantine/core"
import { useMemo, useState } from "react"
import type { DetailedScheduleItem } from "@open-event-systems/schedule-lib"
import {
  makeItemNavPropsMap,
  makeRenderItemDetailsFunc,
  parsers,
} from "../schedule.js"
import { makeMapLocationMatchFunc } from "@open-event-systems/schedule-map"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  itemQueryOptions,
  useScheduleAPI,
} from "@open-event-systems/schedule-react"

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
      return items.byType.event.find((e) => e.id == eventId)
    },
  })

  if (!event.data) {
    throw notFound({ routeId: filterStateRoute.id })
  }

  return <ItemDetails item={event.data} />
}

export const ItemDetails = ({ item }: { item: DetailedScheduleItem }) => {
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
    () =>
      makeItemNavPropsMap(
        router,
        router.origin ?? "",
        getCurrentURL(),
        locMatchFunc,
        [item],
      ),
    [router, router.origin, getCurrentURL, locMatchFunc, item],
  )
  const renderItemDetailsFunc = useMemo(
    () => makeRenderItemDetailsFunc(navPropsMap),
    [navPropsMap],
  )

  const details = renderItemDetailsFunc({
    item,
    large: true,
    showShare: true,
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
