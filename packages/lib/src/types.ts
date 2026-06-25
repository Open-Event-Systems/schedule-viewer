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
  startDate?: Dayjs
  endDate?: Dayjs
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
 * An object describing the session's selections according to the server.
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
    base: ServerSessionSelections | null

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
    date: Date | null
  }>

/**
 * Stores and maintains a current {@link LocalSessionSelections} object.
 */
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
 * API to get/sync selections from a server.
 */
export type SelectionsServiceAPI = Readonly<{
  /**
   * The current session token.
   */
  sessionToken: string | null

  /**
   * Subscribe to changes in the available state/session token.
   */
  subscribe: (callback: () => void) => () => void

  /**
   * Get the selections by ID, or null if not found.
   */
  getSelections: (selectionsId: string) => Promise<ServerSelections | null>

  /**
   * Get item selection counts.
   */
  getCounts: (type: SelectionsType) => Promise<ReadonlyMap<string, number>>

  /**
   * Get the current session's selections.
   */
  getSessionSelections: (
    type: SelectionsType,
  ) => Promise<ServerSessionSelections>

  /**
   * Update the current session's selections.
   */
  updateSessionSelections: (
    type: SelectionsType,
    update?: {
      add?: Iterable<string> | null | undefined
      selections?: Iterable<string> | null | undefined
      delete?: Iterable<string> | null | undefined
    },
  ) => Promise<ServerSessionSelections>
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
