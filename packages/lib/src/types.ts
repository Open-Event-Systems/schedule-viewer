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

export type ScheduleEventStatus = (typeof ScheduleEventStatus)[keyof typeof ScheduleEventStatus]

export type ScheduleObjectBaseProps = Readonly<{
  id: string
  type: string

  name?: string
  alternateNames?: readonly string[]
  description?: string
  images?: readonly Image[]
  tags?: ReadonlySet<string>

  startDate?: Dayjs
  endDate?: Dayjs
  duration?: Duration
  locations?: readonly string[]
  occurrences?: readonly Occurrence[]
}>

export type Occurrence = Readonly<{
  id: string
  startDate?: Dayjs
  endDate?: Dayjs
  duration?: Duration
  locations?: readonly string[]
}>

export type ScheduleEvent = ScheduleObjectBaseProps & Readonly<{
  type: "event"
  eventStatus?: ScheduleEventStatus

  organizers?: readonly string[]
  performers?: readonly string[]
}>

export type Vendor = ScheduleObjectBaseProps & Readonly<{
  type: "vendor"
  email?: string
  logo?: Image
  urls?: readonly string[]
}>

export type Profile = ScheduleObjectBaseProps & Readonly<{
  type: "profile"
  email?: string
  logo?: Image
  urls?: readonly string[]
}>

export type Amenity = ScheduleObjectBaseProps & Readonly<{
  type: "amenity",
}>

export type Address = Readonly<{
  streetAddress?: string
  extendedAddress?: string
  postOfficeBoxNumber?: string
  addressLocality?: string
  addressRegion?: string
  addressCountry?: string
  postalCode?: string
}>

export type Location = ScheduleObjectBaseProps & Readonly<{
  type: "location",
  address?: Address
}>

export interface ScheduleObjectTypeMap {
  event: ScheduleEvent
  vendor: Vendor
  amenity: Amenity
  profile: Profile
  location: Location
}

export type ScheduleObjectType = keyof ScheduleObjectTypeMap

export type ScheduleObject = ScheduleObjectTypeMap[keyof ScheduleObjectTypeMap]

export type ScheduleObjectOccurrence<T extends ScheduleObject = ScheduleObject> = Readonly<{
  id: string
  object: T
  startDate?: Dayjs
  endDate?: Dayjs
  duration?: Duration
  locations?: readonly string[]
}>


export type ScheduleDataTypeMap<D extends ScheduleObjectBaseProps> = {
  readonly [key: string]: D
}

export type ScheduleData<D extends ScheduleObjectBaseProps, M extends ScheduleDataTypeMap<D>> = Readonly<{
  items: readonly M[keyof M][]
  byId: ReadonlyMap<string, M[keyof M]>
  byType: {
    readonly [K in keyof M]: {
      readonly items: readonly M[K][]
      readonly byId: ReadonlyMap<string, M[K]>
    }
  }
  other: readonly D[]
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
  getItems(): Promise<readonly ScheduleObject[]>
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
