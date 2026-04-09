import {
  type Selections,
  type ServerSelections,
  type LocalSessionSelections,
  type ServerSessionSelections,
} from "./types.js"
import z from "zod"
import { format, isValid, parseISO } from "date-fns"

class SelectionsImpl {
  protected set: ReadonlySet<string>
  public id?: string
  public date?: Date | null

  constructor(
    items?: Iterable<string> | null,
    options?: { id?: string; date?: Date | null },
  ) {
    if (items instanceof SelectionsImpl) {
      this.set = items.set
    } else if (items instanceof Set) {
      this.set = items
    } else {
      this.set = new Set(items)
    }

    if (options?.id != null) {
      this.id = options.id
    }

    if (options?.date) {
      this.date = options.date
    }
  }

  get size(): number {
    return this.set.size
  }

  [Symbol.iterator](): Iterator<string> {
    return this.set[Symbol.iterator]()
  }

  has(itemId: string): boolean {
    return this.set.has(itemId)
  }

  add(...itemIds: string[]): SelectionsImpl {
    const newSet = new Set(this.set)
    itemIds.forEach((i) => newSet.add(i))
    return new SelectionsImpl(newSet)
  }

  delete(...itemIds: string[]): SelectionsImpl {
    const newSet = new Set(this.set)
    itemIds.forEach((i) => newSet.delete(i))
    return new SelectionsImpl(newSet)
  }

  equals(other: Iterable<string>): boolean {
    if (other instanceof SelectionsImpl || other instanceof Set) {
      return other.size == this.size && setHasAll(this.set, other)
    } else {
      const otherArr = [...other]
      return otherArr.length == this.size && setHasAll(this.set, otherArr)
    }
  }
}

type LocalSelectionsConstructorOptions = Readonly<{
  base?: ServerSessionSelections | null | undefined
  added?: Iterable<string> | null | undefined
  deleted?: Iterable<string> | null | undefined
  date?: Date | null | undefined
}>

class LocalSelectionsImpl extends SelectionsImpl {
  public base: ServerSessionSelections | null = null
  public added: ReadonlySet<string>
  public deleted: ReadonlySet<string>

  constructor(
    current?: Iterable<string> | null,
    opts?: LocalSelectionsConstructorOptions,
  ) {
    super(current)
    const { base, added, deleted, date } = opts ?? {}

    if (base) {
      this.base = base
    }

    this.added = new Set(added)
    this.deleted = new Set(deleted)
    this.date = null

    if (date) {
      this.date = date
    }
  }

  add(...itemIds: string[]): LocalSelectionsImpl {
    const newSet = new Set(this.set)
    const newAdded = new Set(this.added)
    const newDeleted = new Set(this.deleted)

    for (const itemId of itemIds) {
      if (!newSet.has(itemId)) {
        newSet.add(itemId)
        if (newDeleted.has(itemId)) {
          newDeleted.delete(itemId)
        } else newAdded.add(itemId)
      }
    }

    return new LocalSelectionsImpl(newSet, {
      added: newAdded,
      deleted: newDeleted,
      base: this.base,
      date: new Date(),
    })
  }

  delete(...itemIds: string[]): LocalSelectionsImpl {
    const newSet = new Set(this.set)
    const newAdded = new Set(this.added)
    const newDeleted = new Set(this.deleted)

    for (const itemId of itemIds) {
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
        if (newAdded.has(itemId)) {
          newAdded.delete(itemId)
        } else {
          newDeleted.add(itemId)
        }
      }
    }

    return new LocalSelectionsImpl(newSet, {
      added: newAdded,
      deleted: newDeleted,
      base: this.base,
      date: new Date(),
    })
  }
}

const setHasAll = (
  set: ReadonlySet<string>,
  other: Iterable<string>,
): boolean => {
  for (const item of other) {
    if (!set.has(item)) {
      return false
    }
  }
  return true
}

/**
 * Return a {@link Selections} with the given items.
 */
export const makeSelections = (items?: Iterable<string> | null): Selections => {
  if (items instanceof SelectionsImpl) {
    return items
  } else {
    return new SelectionsImpl(new Set(items))
  }
}

/**
 * Make a {@link LocalSessionSelections} object with the given items and options.
 */
export const makeLocalSessionSelections = (
  items?: Iterable<string> | null,
  opts?: LocalSelectionsConstructorOptions,
): LocalSessionSelections => {
  if (items instanceof SelectionsImpl) {
    return new LocalSelectionsImpl(items, opts) as LocalSessionSelections
  } else {
    return new LocalSelectionsImpl(
      new Set(items),
      opts,
    ) as LocalSessionSelections
  }
}

const isoDate = z.codec(
  z.string(),
  z.date().refine((v) => isValid(v), { error: "Invalid date" }),
  {
    decode: (v) => parseISO(v),
    encode: (v) => format(v, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
  },
)

const selectionsSchema = z.codec(
  z.object({
    items: z.array(z.string()),
  }),
  z.custom<Selections>(),
  {
    decode: (v) => new SelectionsImpl(v.items),
    encode: (v) => ({ items: [...v] }),
  },
)

const serverSelectionsSchema = z.codec(
  z.object({
    ...selectionsSchema.in.shape,
    id: z.string(),
  }),
  z.custom<ServerSelections>(),
  {
    decode: (v) =>
      new SelectionsImpl(v.items, { id: v.id }) as ServerSelections,
    encode: (v) => ({ items: [...v], id: v.id }),
  },
)

const serverSessionSelectionsSchema = z.codec(
  z.object({
    selections: serverSelectionsSchema,
    date: isoDate.nullish(),
  }),
  z.custom<ServerSessionSelections>(),
  {
    decode: (v) =>
      new SelectionsImpl(v.selections, {
        id: v.selections.id,
        date: v.date,
      }) as ServerSessionSelections,
    encode: (v) => ({ selections: v, date: v.date }),
  },
)

const localSessionSelectionsSchema = z.codec(
  z.object({
    ...selectionsSchema.in.shape,
    base: serverSessionSelectionsSchema.nullish(),
    added: z.array(z.string()).nullish(),
    deleted: z.array(z.string()).nullish(),
    date: isoDate.nullish(),
  }),
  z.custom<LocalSessionSelections>(),
  {
    decode: (v) =>
      new LocalSelectionsImpl(v.items, {
        base: v.base,
        added: v.added,
        deleted: v.deleted,
        date: v.date,
      }) as LocalSessionSelections,
    encode: (v) => ({
      items: [...v],
      added: [...v.added],
      deleted: [...v.deleted],
      base: v.base,
      date: v.date,
    }),
  },
)

/**
 * Parse a {@link Selections} object.
 */
export const parseSelections = (data: unknown): Selections =>
  selectionsSchema.parse(data)

/**
 * Parse a {@link ServerSelections} object.
 */
export const parseServerSelections = (data: unknown): ServerSelections =>
  serverSelectionsSchema.parse(data)

/**
 * Parse a {@link ServerSessionSelections} object.
 */
export const parseServerSessionSelections = (
  data: unknown,
): ServerSessionSelections => serverSessionSelectionsSchema.parse(data)

/**
 * Parse a {@link LocalSessionSelections} object.
 */
export const parseLocalSessionSelections = (
  data: unknown,
): LocalSessionSelections => localSessionSelectionsSchema.parse(data)

/**
 * Encode a {@link LocalSessionSelections} object to JSON-able data.
 */
export const encodeLocalSessionSelections = (
  localSels: LocalSessionSelections,
): z.input<typeof localSessionSelectionsSchema> =>
  localSessionSelectionsSchema.encode(localSels)
