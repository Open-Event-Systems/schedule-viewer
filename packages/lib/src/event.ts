import { isBefore, parseISO } from "date-fns"
import { Event as EventT, EventJSON, Timespan, Scheduled } from "./types.js"
import { toTimezone } from "./time.js"

/**
 * Create an {@link EventT} from an object.
 */
export const makeEvent = (data: EventT | EventJSON, tz?: string): EventT => {
  const start =
    typeof data.start == "string"
      ? toTimezone(parseISO(data.start), tz)
      : data.start
  const end =
    typeof data.end == "string" ? toTimezone(parseISO(data.end), tz) : data.end
  return {
    ...data,
    start,
    end,
  }
}

/**
 * Return whether an event has a start/end time set.
 */
export const isScheduled = <T extends Partial<Timespan>>(
  t: T,
): t is Scheduled<T> => {
  return t.start != null && t.end != null
}

/**
 * Return a filter for events matching the given search string.
 */
export const makeTitleFilter = (
  title: string,
): ((
  event: Pick<EventT, "title">,
) => event is Required<Pick<EventT, "title">>) => {
  const lowerTitle = title.trim().toLowerCase()
  return (event): event is Required<Pick<EventT, "title">> =>
    !!event.title && event.title.toLowerCase().includes(lowerTitle)
}

/**
 * Return a filter for events not containing disabled tags.
 */
export const makeTagFilter = (
  tags: Iterable<string>,
): ((event: Pick<EventT, "tags">) => boolean) => {
  const tagSet = new Set(tags)
  return (event) => !event.tags || !event.tags.some((t) => tagSet.has(t))
}

/**
 * Return a filter for events that have not passed.
 */
export const makePastEventFilter = (
  now: Date,
): ((event: Pick<EventT, "end">) => event is Required<Pick<EventT, "end">>) => {
  return (event): event is Required<Pick<EventT, "end">> =>
    !event.end || isBefore(now, event.end)
}

/**
 * Get a filter function for events beginning in the given {@link Timespan}.
 */
export const makeDateFilter = (
  range: Timespan,
): (<T extends Pick<EventT, "start">>(event: T) => event is Scheduled<T>) => {
  return <T extends Pick<EventT, "start">>(e: T): e is Scheduled<T> => {
    if (!e.start) {
      return false
    }
    return !isBefore(e.start, range.start) && isBefore(e.start, range.end)
  }
}
