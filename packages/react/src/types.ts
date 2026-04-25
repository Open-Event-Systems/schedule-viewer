export type TagEntry = Readonly<{
  tag: string
  title: string
}>

export type TagIndicatorEntry = Readonly<{
  tags: readonly string[]
  label: string
}>

/**
 * Schedule configuration object.
 */
export type ScheduleConfig = Readonly<{
  id: string

  items: readonly (string | Readonly<Record<string, unknown>>)[]

  /**
   * The start of the overall event schedule.
   */
  start: Date

  /**
   * The end of the overall event schedule.
   */
  end: Date

  title?: string
  description?: string

  dayChangeHour: number
  dayFormat: string
  timeZone: string

  tags: readonly TagEntry[]
  tagIndicators: readonly TagIndicatorEntry[]

  /**
   * @deprecated
   */
  bookmarks?: string
  selectionsService?: string

  icalPrefix: string
  icalDomain?: string
}>
