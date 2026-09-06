import type { Dayjs } from "dayjs"
import type { MouseEvent } from "react"

export type TagViewProps = Readonly<{
  value: string
  label?: string
  color?: string | Iterable<string>
  indicator?: string
  indicatorColor?: string
  textColor?: string
  before?: string
  after?: string
}>

export type LocationViewProps = Readonly<{
  name?: string
  href?: string
  onClick?: (e: MouseEvent) => void
}>

export type OccurrenceViewProps = Readonly<{
  startDate?: Dayjs
  endDate?: Dayjs
  locations?: Iterable<string | LocationViewProps>
}>

export type ContactViewProps = Readonly<{
  name?: string
  iconURL?: string
  href?: string
  onClick?: (e: MouseEvent) => void
}>

export type ItemViewProps = Readonly<{
  href?: string
  name?: string
  description?: string
  occurrences?: Iterable<OccurrenceViewProps>
  contacts?: Iterable<string | ContactViewProps>
  tags?: Iterable<string>
  isBookmarked?: boolean
  isVisited?: boolean
  bookmarkCount?: number
  onSetBookmarked?: (isBookmarked: boolean) => void
  onSetVisited?: (isVisited: boolean) => void
  headerImageURL?: string
}>




/**
 * Tag display configuration entry.
 */
export type TagConfigEntry = Readonly<{
  tag: string
  name: string
}>

/**
 * Configuration for an indicator to display with certain tags.
 */
export type TagIndicatorConfigEntry = Readonly<{
  tags: readonly string[]
  label: string
}>

/**
 * Schedule configuration object.
 */
export type ScheduleConfig = Readonly<{
  /**
   * The ID of the schedule.
   */
  id: string

  /**
   * The schedule slug.
   */
  identifier: string

  items: readonly (string | Readonly<Record<string, unknown>>)[]

  /**
   * The start of the overall event schedule.
   */
  startDate: Dayjs

  /**
   * The end of the overall event schedule.
   */
  endDate: Dayjs

  /**
   * The schedule name.
   */
  name?: string

  /**
   * The schedule description.
   */
  description?: string

  dayChangeHour: number
  dayFormat: string
  timeZone: string

  tags: readonly TagConfigEntry[]
  tagIndicators: readonly TagIndicatorConfigEntry[]

  /**
   * @deprecated
   */
  bookmarks?: string
  selectionsService?: string

  icalPrefix: string
  icalDomain?: string
}>
