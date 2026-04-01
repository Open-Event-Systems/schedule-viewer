/**
 * A time interval.
 */
export type Interval = Readonly<{
  start?: Date
  end?: Date
}>

/**
 * An {@link Interval} with start and end.
 */
export type Bounded<T extends Interval> = T &
  Readonly<{ start: Date; end: Date }>

/**
 * An interval representing a day, subject to the day change hour.
 */
export type Day = Readonly<{
  key: string
  start: Date
  end: Date
}>

/**
 * A contact related to a schedule item.
 */
export type Contact = Readonly<{
  name?: string
  url?: string
}>

/**
 * Something that can be in a schedule.
 */
export type ScheduleItem = Readonly<{
  id: string
  type: string
  start?: Date
  end?: Date
}>

/**
 * Standard schedule item details.
 */
export type ScheduleItemDetails = Readonly<{
  title?: string
  description?: string
  location?: string
  contacts?: readonly Contact[]
  tags?: ReadonlySet<string>
  icon?: string
  image?: string
}>

/**
 * A {@link ScheduleItem} with standard details.
 */
export type DetailedScheduleItem = ScheduleItem & ScheduleItemDetails

export type ScheduleEvent = DetailedScheduleItem & {
  readonly type: "event"
}

export type Vendor = DetailedScheduleItem & {
  readonly type: "vendor"
}

export type MapFlag = ScheduleItem & {
  readonly type: "map-flag"
}

export type ParseResult<T> = Readonly<
  | { success: true; value: T }
  | { success: false; message?: string; error?: unknown }
>

export type Parser<T, S = unknown> = (value: S) => ParseResult<T>

/**
 * Stores {@link ScheduleItem} objects.
 */
export type ScheduleItemCollection<T extends ScheduleItem = ScheduleItem> =
  Readonly<{
    get size(): number
    get items(): readonly T[]

    [Symbol.iterator](): Iterator<T>

    get(id: string): T | undefined

    filter<N extends T>(f: (item: T, index: number) => item is N): Iterable<N>
    filter(f: (item: T, index: number) => boolean): Iterable<T>

    map<N>(f: (item: T, index: number) => N): Iterable<N>
  }>

/**
 * Fetches schedule items.
 */
export type ScheduleAPI = Readonly<{
  getItems(): Promise<readonly ScheduleItem[]>
}>

/**
 * A set of selected item IDs.
 */
export type Selections = Readonly<{
  /**
   * Return whether this object contains the given IDs.
   */
  has: (itemId: string) => boolean

  [Symbol.iterator]: () => Iterator<string>
  readonly size: number

  /**
   * Return a {@link Selections} object with the given IDs added.
   */
  add: (...itemsIds: string[]) => Selections

  /**
   * Return a {@link Selections} object with the given IDs removed.
   */
  delete: (...itemsIds: string[]) => Selections

  /**
   * Returns whether this object contains exactly the IDs in the given iterable.
   */
  equals: (other: Iterable<string>) => boolean
}>

/**
 * A {@link Selections} object with a server assigned ID.
 */
export type ServerSelections = Selections &
  Readonly<{
    id: string
  }>

/**
 * An object describing the session's selections.
 */
export type ServerSessionSelections = ServerSelections &
  Readonly<{
    /**
     * The date the selections were updated.
     */
    date?: Date
  }>

export type SelectionsType = "bookmarks" | "visited"

/**
 * The locally stored session selections information.
 */
export type LocalSessionSelections = Omit<Selections, "add" | "delete"> &
  Readonly<{
    /**
     * The {@link ServerSessionSelections} object the current selections are based on.
     */
    base?: ServerSessionSelections

    /**
     * The IDs added to the base.
     */
    added: ReadonlySet<string>

    /**
     * The IDs deleted from the base.
     */
    deleted: ReadonlySet<string>

    /**
     * Return a {@link LocalSessionSelections} object with the given IDs added.
     */
    add: (...itemsIds: string[]) => LocalSessionSelections

    /**
     * Return a {@link LocalSessionSelections} object with the given IDs removed.
     */
    delete: (...itemsIds: string[]) => LocalSessionSelections

    /**
     * The date the selections were last updated.
     */
    date?: Date
  }>

export type LocalSessionSelectionsStore = Readonly<{
  /**
   * Get the current selections.
   */
  get: () => LocalSessionSelections

  /**
   * Add the given item IDs to the selections.
   */
  add: (...itemIds: string[]) => LocalSessionSelections

  /**
   * Remove the given item IDs from the selections.
   */
  delete: (...itemIds: string[]) => LocalSessionSelections

  /**
   * Replace the selections with the given item IDs.
   */
  save: (newSelections: LocalSessionSelections) => LocalSessionSelections

  /**
   * Subscribe to changes.
   */
  subscribe: (callback: () => void) => () => void
}>

/**
 * API to get selections information from a server.
 */
export type ServerSelectionsAPI = Readonly<{
  /**
   * Get the session token for syncing.
   */
  getSessionToken: () => Promise<string>

  /**
   * Get the selections by ID, or null if not found.
   */
  getSelections: (selectionsId: string) => Promise<ServerSelections | null>

  /**
   * Get item selection counts.
   */
  getCounts: (type: SelectionsType) => Promise<ReadonlyMap<string, number>>
}>

export type ServerSessionSelectionsAPI = Readonly<{
  /**
   * Get the current selections.
   */
  get: () => Promise<ServerSessionSelections>

  /**
   * Update the session selections.
   */
  update: (opts?: {
    selections?: Iterable<string> | undefined
    add?: Iterable<string> | undefined
    delete?: Iterable<string> | undefined
  }) => Promise<ServerSessionSelections>
}>

export type SessionSelectionsAPI = Readonly<{
  /**
   * Get the current selections.
   */
  get: () => Promise<Selections>

  /**
   * Add the given item IDs to the selections.
   */
  add: (...itemIds: string[]) => Promise<Selections>

  /**
   * Remove the given item IDs from the selections.
   */
  delete: (...itemIds: string[]) => Promise<Selections>

  /**
   * Replace the selections with the given item IDs.
   */
  save: (itemIds: Iterable<string>) => Promise<Selections>
}>
