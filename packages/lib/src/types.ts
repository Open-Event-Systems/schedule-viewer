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
 * A collection of selected event IDs.
 */
export type Selections = Readonly<{
  id?: string
  date?: Date
  items: ReadonlySet<string>
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

export type UpdateSelectionsOptions = Readonly<{
  add?: Iterable<string>
  remove?: Iterable<string>
}>

export type SelectionsType = "bookmarks" | "visited"

/**
 * Saves/loads selections.
 */
export type SelectionsAPI = Readonly<{
  getSelections(selectionsId: string): Promise<Selections | null>
  getSessionSelections(type: SelectionsType): Promise<Selections>
  setSessionSelections(
    type: SelectionsType,
    selections: Selections,
  ): Promise<Selections>
  updateSessionSelections(
    type: SelectionsType,
    options: UpdateSelectionsOptions,
  ): Promise<Selections>
}>

/**
 * A {@link SelectionsAPI} via HTTP service.
 */
export type SelectionsServiceAPI = SelectionsAPI &
  Readonly<{
    get sessionId(): string
    getBookmarkCounts(): Promise<Readonly<Record<string, number | undefined>>>
  }>

/**
 * Saves and loads selections.
 */
export type BookmarkAPI = Readonly<{
  getSelections(selectionsId: string): Promise<Selections | null>
  getSessionSelections(): Promise<Selections>
  setSessionSelections(selections: Selections): Promise<Selections>
}>

/**
 * A {@link BookmarkAPI} via HTTP service.
 */
export type BookmarkServiceAPI = BookmarkAPI &
  Readonly<{
    get sessionId(): string
    getBookmarkCounts(): Promise<Readonly<Record<string, number | undefined>>>
  }>
