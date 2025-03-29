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
  events: string | readonly EventJSON[],
  timeZone: string,
): UseSuspenseQueryOptions<EventStore> => {
  return {
    queryKey: ["events", { events: events }],
    async queryFn() {
      let resArr: EventJSON[] = []

      if (Array.isArray(events)) {
        resArr = events
      } else if (typeof events == "string") {
        const json = await wretch(events).get().json<{ events: EventJSON[] }>()
        resArr = json.events
      }
      const parsedArr: Event[] = []

      for (const eventJSON of resArr) {
        try {
          parsedArr.push(makeEvent(eventJSON, timeZone))
        } catch (e) {
          console.warn(`Error parsing event: ${e}`)
        }
      }

      const store = makeEventStore(parsedArr)

      return store
    },
    staleTime: 300000,
  }
}

export const useEvents = (
  events: string | readonly EventJSON[],
  timeZone: string,
): EventStore => {
  const query = useSuspenseQuery(getEventsQueryOptions(events, timeZone))
  return query.data
}
