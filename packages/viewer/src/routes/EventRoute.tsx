import { EventDetails } from "@open-event-systems/schedule-components/details/EventDetails"
import { eventRoute, eventsRoute } from "./index.js"
import { Link } from "@tanstack/react-router"
import { Anchor } from "@mantine/core"
import { observer } from "mobx-react-lite"
import { useBookmarkStore } from "../bookmarks.js"
import { useCallback } from "react"

export const EventRoute = observer(() => {
  const { event } = eventRoute.useLoaderData()
  const bookmarkStore = useBookmarkStore()

  const bookmarked = bookmarkStore.has(event.id)
  const setBookmarked = useCallback(
    (set: boolean) => {
      if (set) {
        bookmarkStore.add(event.id)
      } else {
        bookmarkStore.delete(event.id)
      }
    },
    [bookmarkStore]
  )

  return (
    <>
      <Anchor component={Link} to={eventsRoute.to} size="sm">
        &laquo; Back to schedule
      </Anchor>
      <EventDetails
        key={event.id}
        large
        event={event}
        bookmarked={bookmarked}
        setBookmarked={setBookmarked}
      />
    </>
  )
})

EventRoute.displayName = "EventRoute"
