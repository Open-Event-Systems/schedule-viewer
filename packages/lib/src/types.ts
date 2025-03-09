type JSONScalar = string | number | boolean | null
export type JSONData = JSONScalar | JSONData[] | { [key: string]: JSONData }

export type Timespan = Readonly<{
  start: Date
  end: Date
}>

export interface Host extends Readonly<Record<string, unknown>> {
  readonly name?: string
  readonly url?: string
}

export interface EventJSON extends Readonly<Record<string, unknown>> {
  readonly id: string
  readonly title?: string
  readonly description?: string
  readonly location?: string
  readonly start?: string
  readonly end?: string
  readonly hosts?: readonly (string | Host)[]
  readonly tags?: readonly string[]
}

export interface Event extends Readonly<Record<string, unknown>> {
  readonly id: string
  readonly title?: string
  readonly description?: string
  readonly location?: string
  readonly start?: Date
  readonly end?: Date
  readonly hosts?: readonly (string | Host)[]
  readonly tags?: readonly string[]
}

export type Scheduled<T extends Partial<Timespan>> = T &
  Readonly<{
    start: Date
    end: Date
  }>

export type TagIndicatorEntry = readonly [string | readonly string[], string]

export interface ScheduleConfig {
  readonly id: string
  readonly url?: string
  readonly title?: string
  readonly dayChangeHour?: number
  readonly timeZone?: string
  readonly tagIndicators?: readonly TagIndicatorEntry[]
}

export type RequiredScheduleConfig = ScheduleConfig &
  Required<
    Pick<
      ScheduleConfig,
      "id" | "url" | "title" | "dayChangeHour" | "timeZone" | "tagIndicators"
    >
  >

export type EventStore = {
  get(id: string): Event | undefined
  [Symbol.iterator](): Iterator<Event>
  get events(): readonly Event[]
  get tags(): ReadonlySet<string>
  get first(): Event | undefined
  get last(): Event | undefined
}

export type BookmarkStore = {
  get eventIds(): readonly string[]
  get dateUpdated(): Date
  add(eventId: string): void
  delete(eventId: string): void
  [Symbol.iterator](): Iterator<string>

  keys(): Iterator<string>
  has(eventId: string): boolean
  get size(): number
}

export type BookmarksRequest = Readonly<{
  events: readonly string[]
}>

export type BookmarksResponse = Readonly<{
  id: string
  events: readonly string[]
}>

export type SessionBookmarksResponse = Readonly<{
  id: string
  date: string
  events: readonly string[]
}>

export type BookmarkAPI = {
  setup(): Promise<void>
  getBookmarks(selectionId: string): Promise<BookmarksResponse>
  getSessionBookmarks(): Promise<SessionBookmarksResponse>
  setBookmarks(events: Iterable<string>): Promise<SessionBookmarksResponse>
}
