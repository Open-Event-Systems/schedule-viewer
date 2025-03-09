import wretch from "wretch"
import {
  Event,
  EventJSON,
  EventStore,
  makeEvent,
  makeEventStore,
} from "@open-event-systems/schedule-lib"
import {
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query"

export const getEventsQueryOptions = (
  url: string,
  timeZone: string
): UseSuspenseQueryOptions<EventStore> => {
  return {
    queryKey: ["events", { url: url }],
    async queryFn() {
      const json = await wretch(url).get().json<EventJSON[]>()
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

export const useEvents = (url: string, timeZone: string): EventStore => {
  const query = useSuspenseQuery(getEventsQueryOptions(url, timeZone))
  return query.data
}
