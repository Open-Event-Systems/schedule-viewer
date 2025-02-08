import { EventDetails } from "@open-event-systems/schedule-components/details/EventDetails"
import { eventRoute, eventsDataRoute, eventsRoute } from "./index.js"
import { Link } from "@tanstack/react-router"
import { Anchor } from "@mantine/core"
import { observer } from "mobx-react-lite"

export const EventRoute = observer(() => {
  const { event } = eventRoute.useLoaderData()
  const { bookmarkStore } = eventsDataRoute.useRouteContext()

  const bookmarked = bookmarkStore.events.has(event.id)
  const setBookmarked = (set: boolean) => {
    if (set) {
      bookmarkStore.add(event.id)
    } else {
      bookmarkStore.remove(event.id)
    }
  }

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
