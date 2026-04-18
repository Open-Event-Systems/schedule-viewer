import { RRule, RRuleSet } from "rrule"
import type { ScheduleItem, ScheduleItemDetails } from "./types.js"
import ical, { type ICalEventData } from "ical-generator"

export type CreateICSOptions = Readonly<{
  /**
   * Calendar title.
   */
  title: string

  /**
   * A prefix used to build event UIDs
   */
  prefix: string

  /**
   * A domain added to event UIDs
   */
  domain: string

  /**
   * Timezone.
   */
  timeZone: string

  /**
   * The start date used for events with no explicit start date.
   */
  defaultStart: Date

  /**
   * The end time used for events with no explicit end date.
   */
  defaultEnd: Date
}>

/**
 * Create an iCalenar file containing the provided events.
 *
 * @param itemOccurrences - An iterable of arrays of items, each item being one occurrence
 * @param options - Options
 */
export const createICS = (
  itemOccurrences: Iterable<
    readonly (
      ScheduleItem &
      Pick<ScheduleItemDetails, "title" | "description" | "location">
    )[]
  >,
  options: CreateICSOptions
): string => {
  const now = new Date()

  const calendar = ical({
    name: options.title,
  })


  for (const occs of itemOccurrences) {
    for (const res of processItem(now, occs, options)) {
      calendar.createEvent(res)
    }
  }

  return calendar.toString()
}

const processItem = (now: Date, occurrences: readonly (ScheduleItem &
  Pick<ScheduleItemDetails, "title" | "description" | "location">)[], options: CreateICSOptions): ICalEventData[] => {
  const results: ICalEventData[] = []

  const firstItem = occurrences[0]!

  const attrs = getEventAttrs(now, firstItem, options)

  results.push(attrs)

  if (occurrences.length > 1) {
    const ruleSet = new RRuleSet()

    ruleSet.rrule(new RRule({
      freq: RRule.DAILY,
      count: 1,
    }))

    for (const extraOcc of occurrences.slice(1)) {
      if (extraOcc.start) {
        ruleSet.rdate(extraOcc.start)

        const overrideAttrs = getEventAttrs(now, extraOcc, options)
        overrideAttrs.recurrenceId = extraOcc.start

        results.push(overrideAttrs)

      }
    }

    attrs.repeating = ruleSet
  }

  return results
}

const getEventAttrs = (now: Date, item: ScheduleItem &
  Pick<ScheduleItemDetails, "title" | "description" | "location">, options: CreateICSOptions): ICalEventData => {

  const attrs: ICalEventData = {
    id: `${options.prefix}-${item.id}@${options.domain}`,
    start: item.start ?? options.defaultStart,
    end: item.end ?? options.defaultEnd,
    lastModified: now,
    timezone: options.timeZone,
  }

  if (item.title) {
    attrs.summary = item.title
  }

  if (item.description) {
    attrs.description = item.description
  }

  if (item.location && item.location.length > 0) {
    attrs.location = item.location.join(", ")
  }

  return attrs
}