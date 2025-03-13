import { EventDetails } from "@open-event-systems/schedule-components/details/EventDetails"
import { eventRoute, eventsRoute } from "./index.js"
import { Link } from "@tanstack/react-router"
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

  const scroll = useCallback((el: HTMLElement | null) => {
    if (el) {
      el.scrollIntoView()
    }
  }, [])

  return (
    <>
      <Anchor component={Link} to={eventsRoute.to} size="sm" ref={scroll}>
        &laquo; Back to schedule
      </Anchor>
      <EventDetails
        key={event.id}
        large
        event={event}
        bookmarked={bookmarked}
        setBookmarked={setBookmarked}
        bookmarkCount={count}
      />
    </>
  )
})

EventRoute.displayName = "EventRoute"
