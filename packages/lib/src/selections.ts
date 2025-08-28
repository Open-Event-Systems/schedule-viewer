import { isAfter } from "date-fns"
import { Selections } from "./types.js"

/**
 * Create a {@link Selections} object.
 */
export const makeSelections = (
  eventIds?: Iterable<string>,
  date?: Date,
  id?: string,
): Selections => {
  const s: { -readonly [K in keyof Selections]: Selections[K] } = {
    events: new Set(eventIds ?? []),
  }

  if (date) {
    s.date = date
  }

  if (id) {
    s.id = id
  }

  return s
}

/**
 * Return the newer {@link Selections}.
 */
export const chooseNewer = (a: Selections, b: Selections): Selections => {
  if (a.date && b.date) {
    if (isAfter(b.date, a.date)) {
      return b
    } else {
      return a
    }
  } else if (a.date && !b.date) {
    return a
  } else if (!a.date && b.date) {
    return b
  } else {
    return a
  }
}
