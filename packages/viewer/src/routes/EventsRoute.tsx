import { EventPills } from "@open-event-systems/schedule-components/pills/EventPills"
import { eventsDataRoute } from "./index.js"

export const EventsRoute = () => {
  const { events } = eventsDataRoute.useLoaderData()

  return <EventPills events={events} />
}
