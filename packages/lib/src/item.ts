import { isBefore } from "date-fns"
import { Interval } from "./types.js"
import { contains } from "./time.js"

/**
 * Return a filter for items matching the given search string.
 */
export const makeTitleFilter = (
  title: string,
): (<T extends { readonly title?: string }>(
  event: T,
) => event is T & { readonly title: string }) => {
  const lowerTitle = title.trim().toLowerCase()
  return <T extends { readonly title?: string }>(
    event: T,
  ): event is T & { readonly title: string } =>
    !!event.title && event.title.toLowerCase().includes(lowerTitle)
}

/**
 * Return a filter for events not containing disabled tags.
 */
export const makeTagFilter = (
  tags: Iterable<string>,
): ((event: { readonly tags?: ReadonlySet<string> }) => boolean) => {
  const tagsArr = [...tags]
  return (event) => !tagsArr.some((t) => event.tags && event.tags.has(t))
}

/**
 * Return a filter for events that have not passed.
 */
export const makePastItemFilter = (
  now: Date,
): (<T extends { readonly end?: Date }>(
  event: T,
) => event is T & { readonly end: Date }) => {
  return <T extends { readonly end?: Date }>(
    event: T,
  ): event is T & { readonly end: Date } =>
    !event.end || isBefore(now, event.end)
}

/**
 * Get a filter function for events beginning in the given {@link Interval}.
 */
export const makeDateFilter = (
  range: Interval,
): (<T extends { readonly start?: Date }>(
  event: T,
) => event is T & { readonly start: Date }) => {
  return <T extends { readonly start?: Date }>(
    e: T,
  ): e is T & { readonly start: Date } => {
    if (!e.start) {
      return false
    }
    return contains(range, e.start)
  }
}
