import {
  useBookmarkCount,
  useIsSelected,
  type ItemDetailsItemType,
} from "@open-event-systems/schedule-react"
import { useRenderItemDetailsFunc } from "../schedule.js"
import {
  createLink,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router"
import { useViewerConfig } from "../config.js"
import { eventDetailsRoute, mapRoute, pagesRoute } from "../routes.js"
import { Anchor, Stack } from "@mantine/core"
import { useState } from "react"
import { makeMapLocationMatchFunc } from "@open-event-systems/schedule-map"
import type { MouseEvent } from "react"

declare module "@tanstack/react-router" {
  interface HistoryState {
    backURL?: string
  }
}

export const EventDetailsRoute = () => {
  const { event } = eventDetailsRoute.useLoaderData()
  return <ItemDetails item={event} />
}

export const ItemDetails = ({ item }: { item: ItemDetailsItemType }) => {
  const config = useViewerConfig()

  const router = useRouter()
  const loc = useLocation()
  const navigate = useNavigate()
  const url = new URL(loc.href, window.origin).href

  // hacky way to hold on to the initial back url
  const [backURL] = useState(() => loc.state.backURL)

  const bookmarked = useIsSelected("bookmarks", item.id)
  const bookmarkCount = useBookmarkCount(item.id)

  const mapLocMatchFunc = makeMapLocationMatchFunc(config.map?.locations ?? [])
  const mapLoc = item.location ? mapLocMatchFunc(item.location) : undefined

  let mapURL
  const onClickLocation = (e: MouseEvent) => {
    e.preventDefault()
    navigate({
      to: mapRoute.to,
      hash: `loc=${mapLoc?.id}`,
    })
  }

  if (mapLoc) {
    mapURL =
      window.origin +
      router.history.createHref(
        router.buildLocation({
          to: mapRoute.to,
          hash: `loc=${mapLoc.id}`,
        }).href,
      )
  }

  const renderDetails = useRenderItemDetailsFunc()
  const details = renderDetails({
    item,
    large: true,
    bookmarked,
    bookmarkCount,
    url,
    tags: config.tags,
    showShare: true,
    locationHref: mapURL,
    onClickLocation,
  })

  return (
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
  )
}

const ALink = createLink(Anchor<"a">)
