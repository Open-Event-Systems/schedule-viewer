export type TagEntry = Readonly<{
  tag: string
  title: string
}>

export type TagIndicatorEntry = Readonly<{
  tags: readonly string[]
  label: string
}>

export type ScheduleConfig = Readonly<{
  id: string
  items: readonly (string | Record<string, unknown>)[]
  title: string
  description: string
  dayChangeHour: number
  binMinutes: number
  dayFormat: string
  timeZone: string
  tags: readonly TagEntry[]
  tagIndicators: readonly TagIndicatorEntry[]
  bookmarks?: string
  selectionsService?: string
  icalPrefix: string
  icalDomain: string
}>

export const scheduleViewTypes = {
  "daily-agenda": "Daily Agenda",
  "full-agenda": "Full Agenda",
  catalog: "Catalog",
  tags: "Tags",
} as const

export type ScheduleViewType = keyof typeof scheduleViewTypes
