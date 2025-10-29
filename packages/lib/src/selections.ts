import { isAfter } from "date-fns"
import type { Selections } from "./types.js"
import z from "zod"
import { opt, strDate, strSetSchema } from "./schema.js"

const selectionsSchema = z.object({
  id: opt(z.string()).optional(),
  date: strDate.optional(),
  events: strSetSchema,
})

/**
 * Parse {@link Selections}.
 */
export const parseSelections = (data: unknown): Selections => {
  return selectionsSchema.parse(data)
}

/**
 * Create a {@link Selections} object.
 */
export const makeSelections = (
  eventIds?: Iterable<string>,
  date?: Date,
  id?: string,
): Selections => {
  const newObj: { events: Set<string>; id?: string; date?: Date } = {
    events: new Set(eventIds ?? []),
  }

  if (date) {
    newObj.date = date
  }

  if (id) {
    newObj.id = id
  }

  return newObj
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
  } else if (a.date) {
    return a
  } else if (b.date) {
    return b
  } else {
    return a
  }
}
