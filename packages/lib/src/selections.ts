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
  constructor(items?: Iterable<string> | null) {
    if (items instanceof SelectionsImpl) {
      this.set = items.set
    } else if (items instanceof Set) {
      this.set = items
    } else {
      this.set = new Set(items)
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
  base?: ServerSessionSelections | undefined
  added?: Iterable<string> | undefined
  deleted?: Iterable<string> | undefined
  date?: Date | undefined
}>

class LocalSelectionsImpl extends SelectionsImpl {
  public base?: ServerSessionSelections
  public added: ReadonlySet<string>
  public deleted: ReadonlySet<string>
  public date?: Date

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
    return new LocalSelectionsImpl(items, opts)
  } else {
    return new LocalSelectionsImpl(new Set(items), opts)
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

const looseSelectionsSchema = z.codec(
  z.looseObject({
    items: z.array(z.string()),
  }),
  z.tuple([z.custom<Selections>(), z.looseObject({})]).readonly(),
  {
    decode: (v) => {
      const { items, ...other } = v
      const sels = makeSelections(items)
      return [sels, other] as const
    },
    encode: ([sels, other]) => ({ ...other, items: [...sels] }),
  },
)

const selectionsSchema = z.codec(
  looseSelectionsSchema,
  z.custom<Selections>(),
  {
    decode: ([sels]) => sels,
    encode: (v) => [v, {}] as const,
  },
)

const serverSelectionsSchema = z.codec(
  looseSelectionsSchema.pipe(
    z.tuple([z.custom<Selections>(), z.object({ id: z.string() })]).readonly(),
  ),
  z.custom<ServerSessionSelections>(),
  {
    decode: ([sels, { id }]) => Object.assign(sels, { id }),
    encode: (v) => [v, { id: v.id }] as const,
  },
)

const serverSessionSelectionsSchema = z.codec(
  z.object({
    selections: serverSelectionsSchema,
    date: isoDate.optional(),
  }),
  z.custom<ServerSessionSelections>(),
  {
    decode: (v) =>
      Object.assign(v.selections, v.date ? { date: v.date } : null),
    encode: (v) => ({ selections: v, ...(v.date ? { date: v.date } : null) }),
  },
)

const stringSetSchema = z.codec(
  z.array(z.string()),
  z.custom<ReadonlySet<string>>(),
  {
    decode: (v) => new Set(v),
    encode: (v) => [...v],
  },
)

export const localSessionSelectionsSchema = z.codec(
  looseSelectionsSchema.pipe(
    z
      .tuple([
        z.custom<Selections>(),
        z.object({
          base: serverSessionSelectionsSchema.optional(),
          added: stringSetSchema,
          deleted: stringSetSchema,
          date: isoDate.optional(),
        }),
      ])
      .readonly(),
  ),
  z.custom<LocalSessionSelections>(),
  {
    decode: ([sels, { base, added, deleted, date }]) =>
      makeLocalSessionSelections(sels, { base, added, deleted, date }),
    encode: (v) =>
      [
        v,
        {
          ...(v.base ? { base: v.base } : null),
          added: v.added,
          deleted: v.deleted,
          ...(v.date ? { date: v.date } : null),
        },
      ] as const,
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
