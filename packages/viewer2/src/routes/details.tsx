import {
  useBookmarkCount,
  useIsSelected,
} from "@open-event-systems/schedule-react"
import { useRenderItemDetailsFunc } from "../schedule.js"
import { createLink, useLocation, useRouter } from "@tanstack/react-router"
import { useViewerConfig } from "../config.js"
import { eventDetailsRoute, pagesRoute } from "../routes.js"
import type { ScheduleItem } from "@open-event-systems/schedule-lib"
import { Anchor, Stack } from "@mantine/core"
import { useState } from "react"

declare module "@tanstack/react-router" {
  interface HistoryState {
    backURL?: string
  }
}

export const EventDetailsRoute = () => {
  const { event } = eventDetailsRoute.useLoaderData()
  return <ItemDetails item={event} />
}

export const ItemDetails = ({ item }: { item: ScheduleItem }) => {
  const config = useViewerConfig()

  const router = useRouter()
  const loc = useLocation()
  const url = new URL(loc.href, window.origin).href

  // hacky way to hold on to the initial back url
  const [backURL] = useState(() => loc.state.backURL)

  const bookmarked = useIsSelected("bookmarks", item.id)
  const bookmarkCount = useBookmarkCount(item.id)

  const renderDetails = useRenderItemDetailsFunc()
  const details = renderDetails({
    item,
    large: true,
    bookmarked,
    bookmarkCount,
    url,
    tags: config.tags,
    showShare: true,
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
