import { makeParsedScheduleItemsAPI, type ScheduleAPI } from "@open-event-systems/schedule-lib"
import { parser } from "./parse.js"

export type ViewerConfig = Readonly<{
  /**
   * The schedule URL.
   */
  id: string

  /**
   * The event time zone.
   */
  timeZone: string

  /**
   * The day change hour.
   */
  dayChangeHour: number

  /**
   * Displayed tags.
   */
  tags: Iterable<TagConfig>

  items: Iterable<unknown>
}>


export type TagConfig = Readonly<{
  value: string
  label?: string
  color?: string | readonly string[]
  indicator?: string
  indicatorColor?: string
  textColor?: string
  before?: string
  after?: string
}>


export const DEFAULT_CONFIG = {
  id: "",
  timeZone: "America/New_York",
  dayChangeHour: 6,
  tags: [],
  items: [],
} as const satisfies ViewerConfig

export const makeScheduleAPIFromConfig = (config: ViewerConfig): ScheduleAPI => {
  // TODO: support URLs
  return makeParsedScheduleItemsAPI(parser, config.items)
}