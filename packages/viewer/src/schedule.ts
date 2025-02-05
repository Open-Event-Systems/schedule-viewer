import {
  Event,
  EventJSON,
  RequiredScheduleConfig,
  toTimezone,
} from "@open-event-systems/schedule-lib"
import { UseQueryOptions } from "@tanstack/react-query"
import { parseISO } from "date-fns"

export class ScheduleStore {
  private _events: readonly Event[]
  constructor(public readonly config: RequiredScheduleConfig) {
    this._events = []
  }

  get events(): readonly Event[] {
    return this._events
  }

  setEvents(events: readonly Event[]) {
    this._events = events
  }

  async load(): Promise<readonly Event[]> {
    const resp = await fetch(this.config.url)
    if (!resp.ok) {
      throw new Error(`Schedule fetch returned ${resp.status}`)
    }
    const json: EventJSON[] = await resp.json()
    const events: Event[] = []

    for (const eventJSON of json) {
      try {
        events.push(parseEvent(eventJSON, this.config.timeZone))
      } catch (e) {
        console.warn(`Error parsing event: ${e}`)
      }
    }

    this._events = events

    return events
  }
}

export const getScheduleConfigQueryOptions = (
  url: string
): UseQueryOptions<RequiredScheduleConfig> => {
  return {
    queryKey: ["config", { url: url }],
    async queryFn() {
      const resp = await fetch(url)
      if (!resp.ok) {
        throw new Error(`Schedule config request returned ${resp.status}`)
      }
      return (await resp.json()) as RequiredScheduleConfig
    },
    staleTime: Infinity,
  }
}

export const getEventsQueryOptions = (
  url: string,
  timeZone: string
): UseQueryOptions<readonly Event[]> => {
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
          events.push(parseEvent(eventJSON, timeZone))
        } catch (e) {
          console.warn(`Error parsing event: ${e}`)
        }
      }

      return events
    },
    staleTime: 300000,
  }
}

export const parseEvent = (eventJSON: EventJSON, tz: string): Event => {
  const event = {
    ...eventJSON,
    start: eventJSON.start
      ? toTimezone(parseISO(eventJSON.start), tz)
      : undefined,
    end: eventJSON.end ? toTimezone(parseISO(eventJSON.end), tz) : undefined,
  }
  return event
}
