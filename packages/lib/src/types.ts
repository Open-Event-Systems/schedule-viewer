/**
 * A time interval.
 */
export type Interval = Readonly<{
  start: Date
  end: Date
}>

/**
 * A partial {@link Interval} subtype.
 */
export type Scheduled<T extends Partial<Interval>> = T & Interval

/** @deprecated */
export type Timespan = Interval

/**
 * A collection of selected event IDs.
 */
export type Selections = {
  readonly id?: string
  readonly date?: Date
  readonly events: ReadonlySet<string>
}

export type Host = Readonly<{
  name?: string
  url?: string
}>

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

export type EventJSON = Omit<Event, "start" | "date" | "tags"> &
  Readonly<{
    start?: string
    end?: string
    tags?: readonly string[]
  }>

export type BookmarkAPI = Readonly<{
  getSelections(selectionsId: string): Promise<Selections | null>
  getSessionSelections(): Promise<Selections>
  setSessionSelections(events: Selections): Promise<Selections>
}>

export type EventAPI = Readonly<{
  getEvents(): Promise<readonly Event[]>
}>

// export type TagEntry = readonly [string, string]

// export type TagIndicatorEntry = readonly [string | readonly string[], string]

// export type ScheduleConfig = Readonly<{
//   id: string
//   events: string | readonly EventJSON[]
//   title: string
//   description: string
//   dayChangeHour: number
//   binMinutes: number
//   timeZone: string
//   tags: readonly TagEntry[]
//   tagIndicators: readonly TagIndicatorEntry[]
// }>

// older

// type JSONScalar = string | number | boolean | null
// export type JSONData = JSONScalar | JSONData[] | { [key: string]: JSONData }

// export interface EventJSON extends Readonly<Record<string, unknown>> {
//   readonly id: string
//   readonly title?: string
//   readonly description?: string
//   readonly location?: string
//   readonly start?: string
//   readonly end?: string
//   readonly hosts?: readonly (string | Host)[]
//   readonly tags?: readonly string[]
// }

// export interface Event extends Readonly<Record<string, unknown>> {
//   readonly id: string
//   readonly title?: string
//   readonly description?: string
//   readonly location?: string
//   readonly start?: Date
//   readonly end?: Date
//   readonly hosts?: readonly (string | Host)[]
//   readonly tags?: readonly string[]
// }

// export type Scheduled<T extends Partial<Timespan>> = T &
//   Readonly<{
//     start: Date
//     end: Date
//   }>

// export type TagEntry = readonly [string, string]

// export type TagIndicatorEntry = readonly [string | readonly string[], string]

// export interface ScheduleConfig extends Readonly<Record<string, unknown>> {
//   readonly id: string
//   readonly events: string | readonly EventJSON[]
//   readonly title: string
//   readonly description: string
//   readonly dayChangeHour: number
//   readonly binMinutes: number
//   readonly timeZone: string
//   readonly tags: readonly TagEntry[]
//   readonly tagIndicators: readonly TagIndicatorEntry[]
// }

// export type EventStore = {
//   get(id: string): Event | undefined
//   [Symbol.iterator](): Iterator<Event>
//   get events(): readonly Event[]
//   get tags(): ReadonlySet<string>
//   get first(): Event | undefined
//   get last(): Event | undefined
// }

// export type _Selections = {
//   readonly dateUpdated: Date
//   has(eventId: string): boolean
//   [Symbol.iterator](): Iterator<string>
//   add(eventId: string): Selections
//   delete(eventId: string): Selections
// }

// export type EventsResponse = Readonly<{
//   events: readonly EventJSON[]
// }>

// export type BookmarksResponse = Readonly<{
//   id: string
//   events: readonly string[]
// }>

// export type SessionBookmarksResponse = Readonly<{
//   id?: string
//   date?: string
//   events: readonly string[]
// }>

// export type _BookmarkAPI = Readonly<{
//   getBookmarks(selectionsId: string): Promise<BookmarksResponse | null>
//   getSessionBookmarks(): Promise<SessionBookmarksResponse>
//   setSessionBookmarks(
//     events: Iterable<string>,
//   ): Promise<SessionBookmarksResponse>
// }>

// export type BookmarksRequest = Readonly<{
//   events: readonly string[]
// }>

// export type BookmarkSetupResponse = Readonly<{
//   sessionId: string
// }>

// export type BookmarksResponse = Readonly<{
//   id: string
//   events: readonly string[]
// }>

// export type SessionBookmarksResponse = Readonly<{
//   id: string
//   date: string
//   events: readonly string[]
// }>

// export type BookmarkCountsResponse = Readonly<{
//   counts: Readonly<Record<string, number>>
// }>

// export type BookmarkAPI = Readonly<{
//   setup(sessionId?: string): Promise<BookmarkSetupResponse>
//   getBookmarks(selectionId: string): Promise<BookmarksResponse | null>
//   getSessionBookmarks(): Promise<SessionBookmarksResponse>
//   setBookmarks(events: Iterable<string>): Promise<SessionBookmarksResponse>
//   getBookmarkCounts(): Promise<BookmarkCountsResponse>
// }>
