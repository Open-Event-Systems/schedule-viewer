import {
  useBookmarkCount,
  useIsSelected,
} from "@open-event-systems/schedule-react"
import { useRenderItemDetailsFunc } from "../schedule.js"
import { useLocation } from "@tanstack/react-router"
import { useViewerConfig } from "../config.js"
import { eventDetailsRoute } from "../routes.js"
import type { ScheduleItem } from "@open-event-systems/schedule-lib"

export const EventDetailsRoute = () => {
  const { event } = eventDetailsRoute.useLoaderData()
  return <ItemDetails item={event} />
}

export const ItemDetails = ({ item }: { item: ScheduleItem }) => {
  const config = useViewerConfig()

  const loc = useLocation()
  const url = new URL(loc.href, window.origin).href

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

  return <>{details}</>
}
