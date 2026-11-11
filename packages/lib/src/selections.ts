/**
 * Selections implementations.
 * @module
 */

import z from "zod"
import type {
  BaseSelections,
  ParseResult,
  Selections,
  ServerSelections,
  TrackedSelections,
} from "./types.js"

class SelectionsImpl {
  private set: ReadonlySet<string>

  constructor(items?: Iterable<string>) {
    if (items instanceof SelectionsImpl) {
      this.set = items.set
    } else if (items instanceof Set) {
      this.set = items
    } else {
      this.set = new Set(items)
    }
  }

  has = (itemId: string) => {
    return this.set.has(itemId)
  };

  [Symbol.iterator] = () => this.set[Symbol.iterator]()

  get size() {
    return this.set.size
  }

  add = (...itemIds: string[]) => {
    const newSet = new Set(this.set)
    for (const item of itemIds) {
      newSet.add(item)
    }

    return new SelectionsImpl(newSet)
  }

  remove = (...itemIds: string[]) => {
    const newSet = new Set(this.set)
    for (const item of itemIds) {
      newSet.delete(item)
    }

    return new SelectionsImpl(newSet)
  }

  equals = (other: Iterable<string>) => {
    if (other instanceof SelectionsImpl || other instanceof Set) {
      if (other.size != this.size) {
        return false
      }

      for (const item of this) {
        if (!other.has(item)) {
          return false
        }
      }

      return true
    } else if (Array.isArray(other)) {
      return other.length == this.size && other.every((o) => this.has(o))
    } else {
      const otherArr = [...other]
      return otherArr.length == this.size && otherArr.every((o) => this.has(o))
    }
  }
}

class ServerSelectionsImpl extends SelectionsImpl {
  public id: string

  constructor(id: string, itemIds?: Iterable<string>) {
    super(itemIds)
    this.id = id
  }
}

class TrackedSelectionsImpl extends SelectionsImpl {
  public base: BaseSelections
  public added: ReadonlySet<string>
  public removed: ReadonlySet<string>

  constructor(
    base: BaseSelections,
    added?: Iterable<string>,
    removed?: Iterable<string>,
    itemIds?: Iterable<string>,
  ) {
    super(itemIds)
    this.base = base
    if (added instanceof Set) {
      this.added = added
    } else {
      this.added = new Set(added)
    }

    if (removed instanceof Set) {
      this.removed = removed
    } else {
      this.removed = new Set(removed)
    }
  }

  add = (...itemIds: string[]) => {
    const newSet = new Set(this)
    const newAdded = new Set(this.added)
    const newRemoved = new Set(this.removed)

    for (const item of itemIds) {
      if (!newSet.has(item)) {
        newSet.add(item)
        if (newRemoved.has(item)) {
          newRemoved.delete(item)
        } else {
          newAdded.add(item)
        }
      }
    }

    return new TrackedSelectionsImpl(this.base, newAdded, newRemoved, newSet)
  }

  remove = (...itemIds: string[]) => {
    const newSet = new Set(this)
    const newAdded = new Set(this.added)
    const newRemoved = new Set(this.removed)

    for (const item of itemIds) {
      if (newSet.has(item)) {
        newSet.delete(item)
        if (newAdded.has(item)) {
          newAdded.delete(item)
        } else {
          newRemoved.add(item)
        }
      }
    }

    return new TrackedSelectionsImpl(this.base, newAdded, newRemoved, newSet)
  }
}

/**
 * Return a {@link BaseSelections} object with the given items.
 */
export const makeSelections = (itemIds?: Iterable<string> | null): BaseSelections => {
  if (itemIds instanceof SelectionsImpl) {
    return itemIds
  } else {
    return new SelectionsImpl(new Set(itemIds))
  }
}

/**
 * Return a {@link ServerSelections} object with the given items and ID.
 */
export const makeServerSelections = (
  id: string,
  itemIds?: Iterable<string> | null,
): ServerSelections => {
  if (itemIds instanceof SelectionsImpl) {
    return new ServerSelectionsImpl(id, itemIds)
  } else {
    return new ServerSelectionsImpl(id, new Set(itemIds))
  }
}

/**
 * Make a {@link TrackedSelections} object.
 */
export const makeTrackedSelections = (
  base: BaseSelections,
  added?: Iterable<string> | null,
  removed?: Iterable<string> | null,
  itemIds?: Iterable<string> | null,
): TrackedSelections => {
  return new TrackedSelectionsImpl(base, new Set(added), new Set(removed), new Set(itemIds))
}

/**
 * Return whether an object is a {@link Selections} instance.
 */
export const isSelections = (s: unknown): s is Selections => s instanceof SelectionsImpl

/**
 * Check if a {@link Selections} is a {@link ServerSelections}.
 */
export const isServerSelections = <T extends Selections>(s: T): s is T & ServerSelections =>
  "id" in s && typeof s.id == "string" && !!s.id

/**
 * Check if a {@link Selections} is a {@link TrackedSelections}.
 */
export const isTrackedSelections = <T extends Selections>(s: T): s is T & TrackedSelections =>
  "base" in s && typeof s.base == "object" && !!s.base && Symbol.iterator in s.base

const selectionsSchema = z.codec(
  z.object({
    items: z.array(z.string()),
  }),
  z.custom<BaseSelections>(),
  {
    decode: (v) => makeSelections(v.items),
    encode: (v) => ({ items: [...v] }),
  },
)

const serverSelectionsSchema = z.codec(
  z.object({
    ...selectionsSchema.in.shape,
    id: z.string(),
  }),
  z.custom<ServerSelections>((v) => typeof v == "object" && v != null && "id" in v),
  {
    decode: (v) => makeServerSelections(v.id, v.items),
    encode: (v) => ({ id: v.id, items: [...v] }),
  },
)

const selectionsOrServerSelectionsSchema = z.union([serverSelectionsSchema, selectionsSchema])

const trackedSelectionsSchema = z.codec(
  z.object({
    ...selectionsSchema.in.shape,
    base: selectionsOrServerSelectionsSchema,
    added: z.array(z.string()),
    removed: z.array(z.string()),
  }),
  z.custom<TrackedSelections>((v) => typeof v == "object" && v != null && "base" in v),
  {
    decode: (v) => makeTrackedSelections(v.base ?? makeSelections(), v.added, v.removed, v.items),
    encode: (v) => ({
      base: v.base,
      added: [...v.added],
      removed: [...v.removed],
      items: [...v],
    }),
  },
)

const anySelectionsSchema = z.union([
  trackedSelectionsSchema,
  serverSelectionsSchema,
  selectionsSchema,
])

/**
 * Parse a {@link Selections} object.
 */
export const parseSelections = (data: unknown): ParseResult<Selections> =>
  anySelectionsSchema.safeParse(data)

/**
 * Turn a {@link Selections} object into JSON compatible data.
 */
export const unparseSelections = (sels: Selections): Record<string, unknown> =>
  anySelectionsSchema.encode(sels)
