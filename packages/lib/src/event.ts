import { parseISO } from "date-fns"
import { Event as EventT, EventJSON, ScheduledEvent } from "./types.js"

/**
 * Create an {@link EventT} from an object.
 */
export const makeEvent = (data: EventT | EventJSON): EventT => {
  const start =
    typeof data.start == "string" ? parseISO(data.start) : data.start
  const end = typeof data.end == "string" ? parseISO(data.end) : data.end
  return {
    ...data,
    start,
    end,
  }
}

/**
 * Return whether an event has a start/end time set.
 */
export const isScheduled = <T extends EventT>(
  t: T
): t is T & ScheduledEvent => {
  return t.start != null && t.end != null
}
