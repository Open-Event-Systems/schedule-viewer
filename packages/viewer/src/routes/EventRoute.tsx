import { EventDetails } from "@open-event-systems/schedule-components/details/EventDetails"
import { eventRoute, eventsRoute } from "./index.js"
import { Link, useRouter } from "@tanstack/react-router"
import { Anchor } from "@mantine/core"
import { observer } from "mobx-react-lite"
import { useCallback } from "react"
import {
  useBookmarkCount,
  useBookmarks,
  useUpdateBookmarks,
} from "../bookmarks.js"

export const EventRoute = observer(() => {
  const { config } = eventRoute.useRouteContext()
  const { event } = eventRoute.useLoaderData()
  const selections = useBookmarks(config.id)
  const updateSelections = useUpdateBookmarks(config.id)
  const count = useBookmarkCount(config.id, event.id)
  const router = useRouter()

  const bookmarked = selections.has(event.id)
  const setBookmarked = useCallback(
    (set: boolean) => {
      let newSelections
      if (set) {
        newSelections = selections.add(event.id)
      } else {
        newSelections = selections.delete(event.id)
      }
      updateSelections(newSelections)
    },
    [selections, updateSelections],
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
        bookmarkCount={count}
        showShare
        url={String(
          new URL(
            router.history.createHref(
              router.buildLocation({
                to: eventRoute.to,
                params: {
                  eventId: event.id,
                },
              }).href,
            ),
            window.location.href,
          ),
        )}
      />
    </>
  )
})

EventRoute.displayName = "EventRoute"
