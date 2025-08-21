import { Event, EventAPI, EventJSON } from "./types.js"
import wretch from "wretch"
import { toTimezone } from "./time.js"
import { parseISO } from "date-fns"

export type EventsResponse = Readonly<{
  events: readonly EventJSON[]
}>

/**
 * Create a new {@link EventAPI}
 */
export const makeEventAPI = (url: string, tz?: string): EventAPI => {
  return {
    async getEvents() {
      const res = await wretch(url).get().json<EventsResponse>()
      const events = res.events.map((data) => makeEvent(data, tz))
      return events
    },
  }
}

/**
 * Make an {@link Event} from {@link EventJSON} data.
 */
export const makeEvent = (data: EventJSON, tz?: string): Event => {
  const { start, end, tags, ...rest } = data
  const e: { -readonly [K in keyof Event]: Event[K] } = {
    ...rest,
    tags: new Set(tags),
  }

  if (start) {
    e.start = toTimezone(parseISO(start), tz)
  }

  if (end) {
    e.end = toTimezone(parseISO(end), tz)
  }

  return e
}
