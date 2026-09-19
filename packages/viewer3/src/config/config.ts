/**
 * Viewer configuration settings.
 * @module
 */

import {
  makeParsedScheduleItemsAPI,
  parseScheduleItem,
  parseScheduleItemSeries,
  type ScheduleAPI,
  type ScheduleItemType,
} from "@open-event-systems/schedule-lib"
import {
  makeTagsConfig,
  SchedulePageFeature,
  ScheduleViewType,
  type TagsConfig,
} from "@open-event-systems/schedule-react"

export type ViewerConfig = Readonly<{
  /**
   * The schedule URL.
   */
  id: string

  /**
   * The schedule name.
   */
  name: string

  /**
   * The schedule description.
   */
  description?: string

  /**
   * The event time zone.
   */
  timeZone: string

  /**
   * The day change hour.
   */
  dayChangeHour: number

  /**
   * Displayed tags configuration.
   */
  tags: TagsConfig

  /**
   * Page configs.
   */
  pages: Readonly<Record<string, PageConfig>>

  items: Iterable<unknown>
}>

/**
 * Individual page configuration.
 */
export type PageConfig = Readonly<{
  id: string

  /**
   * The page title.
   */
  name: string

  /**
   * The page description.
   */
  description?: string

  /**
   * The item types to include.
   */
  types: ReadonlySet<ScheduleItemType>

  /**
   * Only include items matching these tags, expressed as a sum of products.
   *
   * An empty array allows all items.
   */
  requireTags: readonly ReadonlySet<string>[]

  /**
   * Exclude items matching these tags, expressed as a sum of products.
   */
  excludeTags: readonly ReadonlySet<string>[]

  /**
   * View configurations.
   */
  views: Readonly<Record<string, ViewConfig>>
}>

/**
 * Page view configuration.
 */
export type ViewConfig = Readonly<{
  [key: string]: unknown

  id: string

  /**
   * The view name.
   */
  name: string

  /**
   * The view type.
   */
  type: ScheduleViewType

  /**
   * Whether items are grouped by day.
   */
  byDay: boolean | "filter"

  /**
   * Enabled features.
   */
  features: ReadonlySet<SchedulePageFeature>
}>

export const DEFAULT_CONFIG = {
  id: "",
  name: "Event Schedule",
  timeZone: "America/New_York",
  dayChangeHour: 6,
  tags: makeTagsConfig({}),
  pages: {},
  items: [],
} as const satisfies ViewerConfig

export const makeScheduleAPIFromConfig = (
  config: ViewerConfig,
): ScheduleAPI => {
  // TODO: support URLs
  return makeParsedScheduleItemsAPI(
    (data) => parseScheduleItemSeries(parseScheduleItem, data),
    config.items,
  )
}
