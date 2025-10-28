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
export type Bounded<T extends Interval> = T & Required<Interval>

/**
 * A collection of selected event IDs.
 */
export type Selections = Readonly<{
  id?: string
  date?: Date
  events: ReadonlySet<string>
}>

/** @deprecated */
export type Host = Readonly<{
  name?: string
  url?: string
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

/** @deprecated */
export type Event = Readonly<{
  id: string
  title?: string
  description?: string
  location?: string
  start?: Date
  end?: Date
  hosts: readonly (string | Host)[]
  tags: ReadonlySet<string>
}>

/** @deprecated */
export type EventJSON = Omit<Event, "start" | "date" | "tags"> &
  Readonly<{
    start?: string
    end?: string
    tags?: readonly string[]
  }>

/**
 * Fetches schedule items.
 */
export type ScheduleAPI = Readonly<{
  getItems(): Promise<readonly ScheduleItem[]>
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

/** @deprecated */
export type EventAPI = Readonly<{
  getEvents(): Promise<readonly Event[]>
}>
