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
 * A set of selected item IDs.
 */
export type Selections = Readonly<{
  has(value: string): boolean
  [Symbol.iterator](): Iterator<string>
  readonly size: number
  add(item: string): Selections
  delete(item: string): Selections
  equals(other: Selections): boolean
}>

/**
 * A {@link Selections} object with a server assigned ID.
 */
export type ServerSelections = Selections &
  Readonly<{
    id: string
    equals(other: Selections | ServerSelections): boolean
  }>

/**
 * The current session's selections.
 */
export type SessionSelections = Readonly<{
  date?: Date
  selections: Selections | ServerSelections
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

type ItemDetails = Readonly<{
  title?: string
  description?: string
  location?: string
  contacts?: readonly Contact[]
  tags?: ReadonlySet<string>
  icon?: string
  image?: string
}>

export type ScheduleEvent = ScheduleItem &
  ItemDetails & {
    readonly type: "event"
  }

export type Vendor = ScheduleItem &
  ItemDetails & {
    readonly type: "vendor"
  }

export type MapFlag = ScheduleItem & {
  readonly type: "map-flag"
}

export type ParseResult<T> = Readonly<
  { success: true; value: T } | { success: false; error: string }
>

export type Parser<T, S = unknown> = (value: S) => ParseResult<T>

/**
 * Fetches schedule items.
 */
export type ScheduleAPI = Readonly<{
  getItems(): Promise<readonly ScheduleItem[]>
}>

export type SelectionsType = "bookmarks" | "visited"

export type LocalSessionSelectionsStatus = Readonly<{
  base: SessionSelections
  added: ReadonlySet<string>
  deleted: ReadonlySet<string>
  current: SessionSelections
}>

export type SessionSelectionsStore = Readonly<{
  get(type: SelectionsType): LocalSessionSelectionsStatus
  save(type: SelectionsType, selections: SessionSelections): void
  add(type: SelectionsType, itemId: string): SessionSelections
  delete(type: SelectionsType, itemId: string): SessionSelections
}>

export type UpdateSelectionsOptions = Readonly<{
  selections?: Iterable<string>
  add?: Iterable<string>
  delete?: Iterable<string>
}>

/**
 * Saves/loads selections.
 */
export type SelectionsAPI = Readonly<{
  get sessionId(): string | undefined
  getSelections(selectionsId: string): Promise<Selections | null>
  getSessionSelections(type: SelectionsType): Promise<SessionSelections>
  updateSessionSelections(
    type: SelectionsType,
    options: UpdateSelectionsOptions,
  ): Promise<SessionSelections>
  getBookmarkCounts(): Promise<ReadonlyMap<string, number | undefined>>
}>
