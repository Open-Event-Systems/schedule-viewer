import {
  Event,
  EventJSON,
  EventStore,
  makeEvent,
  makeEventStore,
  RequiredScheduleConfig,
} from "@open-event-systems/schedule-lib"
import { UseQueryOptions } from "@tanstack/react-query"


export const getEventsQueryOptions = (
  url: string,
  timeZone: string
): UseQueryOptions<EventStore> => {
  return {
    queryKey: ["events", { url: url }],
    async queryFn() {
      const resp = await fetch(url)
      if (!resp.ok) {
        throw new Error(`Schedule fetch returned ${resp.status}`)
      }
      const json: EventJSON[] = await resp.json()
      const events: Event[] = []

      for (const eventJSON of json) {
        try {
          events.push(makeEvent(eventJSON, timeZone))
        } catch (e) {
          console.warn(`Error parsing event: ${e}`)
        }
      }

      const store = makeEventStore(events)

      return store
    },
    staleTime: 300000,
  }
}
