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

export type ScheduledEvent = Event &
  Readonly<{
    start: Date
    end: Date
  }>

export type TagIndicatorEntry = readonly [string | readonly string[], string]

export interface ScheduleConfig {
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
      "url" | "title" | "dayChangeHour" | "timeZone" | "tagIndicators"
    >
  >
