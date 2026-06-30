import { type Dayjs } from "dayjs"
import type {
  EVENT_TYPES,
  JSONLDTypesFromHierarchy,
  ORGANIZATION_TYPES,
} from "./ld.js"

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
 * An image object.
 */
export type ImageObject = Readonly<{
  type: "ImageObject"
  contentUrl?: string
  caption?: string
  width?: number
  height?: number
  encodingFormat?: string
}>

export type ScheduleItemBaseProps = Readonly<{
  id?: string
  identifier?: string
  type: string
  name?: string
  description?: string
  image?: readonly (string | ImageObject)[]
  sameAs?: readonly string[]
  url?: string
}>

export type ScheduleEventStatus = "EventScheduled" | "EventCancelled"

export type ScheduleEventProps = Readonly<{
  type: JSONLDTypesFromHierarchy<typeof EVENT_TYPES>
  status: ScheduleEventStatus
  startDate?: Dayjs
  endDate?: Dayjs
  location?: readonly (string | Place | Address)[]
  organizer?: readonly (string | Person | Organization)[]
  performer?: readonly (string | Person | Organization)[]
  keywords?: ReadonlySet<string>
  superEvent?: string | ScheduleEvent
  subEvent?: readonly (string | ScheduleEvent)[]
}>

export type ScheduleEvent = ScheduleItemBaseProps & ScheduleEventProps

export type PersonProps = Readonly<{
  type: "Person"
  email?: string
}>

export type Person = ScheduleItemBaseProps & PersonProps

export type OrganizationProps = Readonly<{
  type: JSONLDTypesFromHierarchy<typeof ORGANIZATION_TYPES>
  email?: string
  keywords?: ReadonlySet<string>
  logo?: readonly (string | ImageObject)[]
}>

export type Organization = ScheduleItemBaseProps & OrganizationProps

export type AddressProps = Readonly<{
  type: "PostalAddress"
  addressCountry?: string
  addressLocality?: string
  addressRegion?: string
  extendedAddress?: string
  postOfficeBoxNumber?: string
  postalCode?: string
  streetAddress?: string
}>

export type Address = ScheduleItemBaseProps & AddressProps

export type PlaceProps = Readonly<{
  type: "Place"
  address?: string | Address
  event?: readonly (string | ScheduleEvent)[]
}>

export type Place = ScheduleItemBaseProps & PlaceProps

type EventItemMap = {
  [K in JSONLDTypesFromHierarchy<typeof EVENT_TYPES>]: ScheduleEvent
}

type OrganizationItemMap = {
  [K in JSONLDTypesFromHierarchy<typeof ORGANIZATION_TYPES>]: Organization
}

export interface ScheduleItemMap extends EventItemMap, OrganizationItemMap {
  Person: Person
  Place: Place
  PostalAddress: Address
}

export type ScheduleItem = ScheduleItemMap[keyof ScheduleItemMap]

export type ScheduleDataTypeMap = {
  readonly [key: string]: ScheduleItem
}

export type ScheduleData<M extends ScheduleDataTypeMap> = Readonly<{
  byId: ReadonlyMap<string, ScheduleItem>
  byType: {
    readonly [K in keyof M]: ReadonlyMap<string, M[K]>
  }
  other: readonly ScheduleItem[]
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
  getItems(): Promise<readonly ScheduleItem[]>
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
