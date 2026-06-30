import type { Dayjs } from "dayjs"

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
