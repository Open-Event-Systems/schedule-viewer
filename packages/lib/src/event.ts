import { isBefore } from "date-fns"
import { Event as EventT, Interval, Scheduled } from "./types.js"

/**
 * Return whether an event has a start/end time set.
 */
export const isScheduled = <T extends Partial<Interval>>(
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
  const tagsArr = [...tags]
  return (event) => !tagsArr.some((t) => event.tags.has(t))
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
 * Get a filter function for events beginning in the given {@link Interval}.
 */
export const makeDateFilter = (
  range: Interval,
): (<T extends Pick<EventT, "start">>(
  event: T,
) => event is T & Required<Pick<EventT, "start">>) => {
  return <T extends Pick<EventT, "start">>(
    e: T,
  ): e is T & Required<Pick<EventT, "start">> => {
    if (!e.start) {
      return false
    }
    return !isBefore(e.start, range.start) && isBefore(e.start, range.end)
  }
}
