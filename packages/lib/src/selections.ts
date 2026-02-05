import { isAfter } from "date-fns"
import {
  type Selections,
  type ServerSelections,
  type SessionSelections,
} from "./types.js"
import z from "zod"
import { opt, strDate } from "./schema.js"

const selectionsSchema = z.looseObject({
  id: opt(z.string().transform((v) => (v == "" ? undefined : v))).optional(),
  items: z.array(z.string()),
})

const sessionSelectionsSchema = z.looseObject({
  date: strDate.optional(),
  selections: selectionsSchema,
})

export const sessionSelectionsStorageSchema = z.looseObject({
  base: sessionSelectionsSchema,
  added: z.array(z.string()),
  deleted: z.array(z.string()),
  current: sessionSelectionsSchema,
})

class SelectionsImpl {
  public id: string | undefined
  private set: Set<string>
  constructor(itemIds?: Iterable<string>, id?: string) {
    this.set = new Set(itemIds)

    if (id) {
      this.id = id
    }
  }

  has(item: string): boolean {
    return this.set.has(item)
  }

  [Symbol.iterator](): Iterator<string> {
    return this.set[Symbol.iterator]()
  }

  get size(): number {
    return this.set.size
  }

  add(item: string): SelectionsImpl {
    if (this.set.has(item)) {
      return this
    }

    return new SelectionsImpl([...this.set, item])
  }

  delete(item: string): SelectionsImpl {
    if (!this.set.has(item)) {
      return this
    }

    return new SelectionsImpl([...this.set].filter((it) => it != item))
  }

  equals(other: Selections | ServerSelections): boolean {
    if ("id" in other && other.id && this.id) {
      return other.id == this.id
    }

    if (other.size != this.size) {
      return false
    }

    for (const otherItem of other) {
      if (!this.has(otherItem)) {
        return false
      }
    }

    return true
  }
}

/**
 * Make a new {@link Selections} object.
 */
export function makeSelections(
  itemIds: Iterable<string> | undefined,
  id: string,
): ServerSelections
export function makeSelections(
  itemIds?: Iterable<string>,
  id?: undefined,
): Selections
export function makeSelections(
  itemIds?: Iterable<string>,
  id?: string,
): Selections | ServerSelections
export function makeSelections(
  itemIds?: Iterable<string>,
  id?: string,
): Selections | ServerSelections {
  if (id) {
    if (itemIds instanceof SelectionsImpl && itemIds.id == id) {
      return itemIds
    } else {
      return new SelectionsImpl(itemIds, id)
    }
  } else {
    if (itemIds instanceof SelectionsImpl) {
      return itemIds
    } else {
      return new SelectionsImpl(itemIds)
    }
  }
}

/**
 * Make a new {@link SessionSelections} object.
 */
export function makeSessionSelections(
  itemIds?: Iterable<string>,
  date?: Date,
): SessionSelections {
  let ssels: SessionSelections
  if (itemIds instanceof SelectionsImpl) {
    ssels = {
      selections: itemIds,
    }
  } else {
    ssels = {
      selections: makeSelections(itemIds),
    }
  }

  if (date) {
    return { ...ssels, date }
  } else {
    return ssels
  }
}

/**
 * Choose the newer of two {@link SessionSelections}.
 */
export const chooseNewer = (
  a: SessionSelections,
  b: SessionSelections,
): SessionSelections => {
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

/**
 * Parse a {@link Selections} object.
 */
export const parseSelections = (
  data: unknown,
): Selections | ServerSelections => {
  const res = selectionsSchema.parse(data)
  return makeSelections(res.items, res.id)
}

/**
 * Parse a {@link SessionSelections} object
 */
export const parseSessionSelections = (data: unknown): SessionSelections => {
  const res = sessionSelectionsSchema.parse(data)
  const sel = makeSelections(res.selections.items, res.selections.id)
  return makeSessionSelections(sel, res.date)
}
