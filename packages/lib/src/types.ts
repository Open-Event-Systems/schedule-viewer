import { type Dayjs } from "dayjs"
import type { Duration } from "dayjs/plugin/duration.js"

/**
 * A time interval.
 */
export type Interval = Readonly<{
  startDate?: Dayjs | null | undefined
  endDate?: Dayjs | null | undefined
}>

/**
 * An {@link Interval} with start and end.
 */
export type Bounded<T extends Interval> = T &
  Readonly<{ startDate: Dayjs; endDate: Dayjs }>

/**
 * An interval representing a day, subject to the day change hour.
 */
export type Day = Readonly<{
  key: string
  startDate: Dayjs
  endDate: Dayjs
}>

/**
 * Recursively transform a type to be writable.
 */
export type RW<T> = T extends readonly []
  ? []
  : T extends readonly [infer F, ...infer R]
    ? [RW<F>, ...RW<R>]
    : T extends readonly (infer R)[]
      ? RW<R>[]
      : T extends Readonly<Record<string, unknown>>
        ? { -readonly [K in keyof T]: RW<T[K]> }
        : T

/**
 * An image.
 */
export type Image = Readonly<{
  /**
   * The image content URL.
   */
  url: string

  /**
   * The media type.
   */
  mediaType?: string

  /**
   * The width.
   */
  width?: number

  /**
   * The height.
   */
  height?: number
}>

export const ScheduleEventStatus = {
  scheduled: "EventScheduled",
  canceled: "EventCancelled",
} as const

export type ScheduleEventStatus =
  (typeof ScheduleEventStatus)[keyof typeof ScheduleEventStatus]

/**
 * Common schedule item properties.
 */
export type ScheduleItemBaseProps = Readonly<{
  /**
   * A unique id.
   */
  id: string

  /**
   * The type.
   */
  type: string

  /**
   * The item name.
   */
  name?: string

  /**
   * Alternate names.
   */
  alternateNames: readonly string[]

  /**
   * A description.
   */
  description?: string

  /**
   * Images related to the item.
   */
  images: readonly Image[]

  /**
   * Tags describing the item.
   *
   * These should be identifiers, not necessarily the displayed text.
   */
  tags: ReadonlySet<string>

  /**
   * URLs related to the item.
   */
  urls: readonly string[]
}>

export const ContactRole = {
  organizer: "organizer",
  performer: "performer",
} as const

/**
 * The role of a contact for an item.
 */
export type ContactRole = (typeof ContactRole)[keyof typeof ContactRole]

/**
 * A contact for an item.
 *
 * Either provides a name or the id of a {@link Profile}.
 */
export type Contact = Readonly<
  {
    /**
     * The contact's role.
     */
    role: ContactRole
  } & (
    | {
        /** The profile id. */
        id: string
        name?: never
      }
    | {
        id?: never

        /** A name. */
        name: string
      }
  )
>

/**
 * An event.
 */
export type ScheduleEvent = ScheduleItemBaseProps &
  Readonly<{
    type: "event"

    /**
     * The status of the event.
     */
    eventStatus: ScheduleEventStatus

    /**
     * Contacts for to an event.
     */
    contacts: readonly Contact[]
  }>

/**
 * A vendor/exhibitor.
 */
export type Vendor = ScheduleItemBaseProps &
  Readonly<{
    type: "vendor"

    /**
     * An email address.
     */
    email?: string

    /**
     * A logo image.
     */
    logo?: Image
  }>

/**
 * A contact profile.
 */
export type Profile = ScheduleItemBaseProps &
  Readonly<{
    type: "profile"

    /**
     * An email address.
     */
    email?: string

    /**
     * A logo image.
     */
    logo?: Image
  }>

/**
 * An amenity.
 */
export type Amenity = ScheduleItemBaseProps &
  Readonly<{
    type: "amenity"
  }>

/**
 * An address.
 */
export type Address = Readonly<{
  streetAddress?: string
  extendedAddress?: string
  postOfficeBoxNumber?: string
  addressLocality?: string
  addressRegion?: string
  addressCountry?: string
  postalCode?: string
}>

/**
 * A location.
 */
export type Location = ScheduleItemBaseProps &
  Readonly<{
    type: "location"
    address?: Address
  }>

/**
 * Maps type ids to specific types.
 */
export interface ScheduleItemTypeMap {
  event: ScheduleEvent
  vendor: Vendor
  amenity: Amenity
  profile: Profile
  location: Location
}

export type ScheduleItemType = keyof ScheduleItemTypeMap

/**
 * An item in the schedule.
 */
export type ScheduleItem = ScheduleItemTypeMap[keyof ScheduleItemTypeMap]

/**
 * Start/end/duration info.
 */
export type DateInfo = Readonly<{
  startDate?: Dayjs
  endDate?: Dayjs
  duration?: Duration
}>

/**
 * The location of an item occurrence.
 *
 * Either provides a name or the id of a {@link Location}.
 */
export type OccurrenceLocation = Readonly<
  | {
      /** A {@link Location} id. */
      id: string
      name?: never
    }
  | {
      id?: never

      /** A location name. */
      name: string
    }
>

/**
 * An occurrence.
 */
export type Occurrence = DateInfo &
  Readonly<{
    /**
     * An identifier for this occurrence.
     */
    id: string

    /**
     * The status of the occurrence.
     */
    eventStatus: ScheduleEventStatus

    /**
     * The locations of the occurrence.
     */
    locations: readonly OccurrenceLocation[]
  }>

/**
 * An occurrence of a schedule item.
 */
export type ScheduleItemOccurrence<T extends ScheduleItem = ScheduleItem> =
  Occurrence &
    Readonly<{
      /**
       * The {@link ScheduleItem}.
       */
      item: T
    }>

/**
 * A {@link ScheduleItem} and its occurrences.
 */
export type ScheduleItemSeries<T extends ScheduleItem = ScheduleItem> =
  Readonly<{
    item: T
    occurrences: readonly Occurrence[]
  }>

/**
 * A series or single occurrence.
 */
export type SeriesOrOccurrence<T extends ScheduleItem = ScheduleItem> =
  | (ScheduleItemSeries<T> & {
      readonly id?: never
      readonly eventStatus?: never
      readonly startDate?: never
      readonly endDate?: never
      readonly duration?: never
      readonly locations?: never
    })
  | (ScheduleItemOccurrence<T> & {
      readonly occurrences?: never
    })

export type ScheduleItemIndex<T extends ScheduleItem = ScheduleItem> =
  Readonly<{
    [Symbol.iterator]: () => Iterator<ScheduleItemSeries<T>>
    size: number
    getById: (id: string) => ScheduleItemSeries<T> | undefined
    getByName: (name: string) => ScheduleItemSeries<T> | undefined
  }>

export type ScheduleData = Readonly<{
  [Symbol.iterator]: () => Iterator<ScheduleItemSeries>
  size: number
  getById: (id: string) => ScheduleItemSeries | undefined
  getType: <K extends ScheduleItemType>(
    type: K,
  ) => ScheduleItemIndex<ScheduleItemTypeMap[K]>
  getByName: (name: string) => ScheduleItemSeries | undefined
}>

export type ParseResult<T> = Readonly<
  | { success: true; data: T; error?: never; message?: never }
  | { success: false; data?: never; error?: unknown; message?: string }
>

export type Parser<T, S = unknown> = (value: S) => ParseResult<T>

/**
 * Fetches schedule items.
 */
export type ScheduleAPI = Readonly<{
  getItems(): Promise<readonly ScheduleItemSeries[]>
}>

/**
 * A set of selected item IDs.
 */
export type BaseSelections = Readonly<{
  /**
   * Return whether this object contains the given IDs.
   */
  has: (itemId: string) => boolean

  [Symbol.iterator]: () => Iterator<string>

  readonly size: number

  /**
   * Return a {@link BaseSelections} object with the given IDs added.
   */
  add: (...itemsIds: string[]) => BaseSelections

  /**
   * Return a {@link BaseSelections} object with the given IDs removed.
   */
  delete: (...itemsIds: string[]) => BaseSelections

  /**
   * Returns whether this object contains exactly the IDs in the given iterable.
   */
  equals: (other: Iterable<string>) => boolean
}>

/**
 * A {@link BaseSelections} object with a server assigned ID.
 */
export type ServerSelections = BaseSelections &
  Readonly<{
    id: string
  }>

/**
 * A {@link BaseSelections} object that tracks changes.
 */
export type TrackedSelections = Omit<BaseSelections, "add" | "delete"> &
  Readonly<{
    base: BaseSelections | ServerSelections
    added: ReadonlySet<string>
    deleted: ReadonlySet<string>

    /**
     * Return a {@link TrackedSelections} object with the given IDs added.
     */
    add: (...itemsIds: string[]) => TrackedSelections

    /**
     * Return a {@link TrackedSelections} object with the given IDs removed.
     */
    delete: (...itemsIds: string[]) => TrackedSelections
  }>

export type Selections = BaseSelections | ServerSelections | TrackedSelections

export interface SelectionsTypeMap {
  bookmarks: "bookmarks"
  visited: "visited"
}

export type SelectionsType = SelectionsTypeMap[keyof SelectionsTypeMap]

export type SelectionsStore = Readonly<{
  /**
   * Load the selections.
   */
  load: (type: SelectionsType) => Promise<Selections>

  /**
   * Save the selections.
   */
  save: (type: SelectionsType, selections: Selections) => Promise<Selections>
}>

export type SelectionsService = SelectionsStore &
  Readonly<{
    sessionToken: string | null

    /**
     * Load the selections.
     */
    load: (type: SelectionsType) => Promise<ServerSelections>

    /**
     * Get a {@link ServerSelections} by ID.
     */
    getById: (id: string) => Promise<ServerSelections | null>

    /**
     * Get selection counts.
     */
    getCounts: (type: SelectionsType) => Promise<ReadonlyMap<string, number>>

    /**
     * Subscribe to session token updates.
     */
    subscribe: (callback: () => void) => () => void
  }>
