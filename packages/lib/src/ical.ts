// import { RRule, RRuleSet } from "rrule"
// import type { ScheduleEvent } from "./types.js"
// import ical, { type ICalEventData } from "ical-generator"
// import type { Dayjs } from "dayjs"

// export type CreateICSOptions = Readonly<{
//   /**
//    * Calendar name.
//    */
//   name: string

//   /**
//    * A prefix used to build event UIDs
//    */
//   prefix: string

//   /**
//    * A domain added to event UIDs
//    */
//   domain: string

//   /**
//    * Timezone.
//    */
//   timeZone: string

//   /**
//    * The start date used for events with no explicit start date.
//    */
//   defaultStartDate: Dayjs

//   /**
//    * The end time used for events with no explicit end date.
//    */
//   defaultEndDate: Dayjs
// }>

// /**
//  * Create an iCalenar file containing the provided events.
//  *
//  * @param itemOccurrences - An iterable of arrays of items, each item being one occurrence
//  * @param options - Options
//  */
// export const createICS = (
//   itemOccurrences: Iterable<readonly ScheduleEvent[]>,
//   options: CreateICSOptions,
// ): string => {
//   const now = new Date()

//   const calendar = ical({
//     name: options.name,
//   })

//   for (const occs of itemOccurrences) {
//     for (const res of processItem(now, occs, options)) {
//       calendar.createEvent(res)
//     }
//   }

//   return calendar.toString()
// }

// const processItem = (
//   now: Date,
//   occurrences: readonly ScheduleEvent[],
//   options: CreateICSOptions,
// ): ICalEventData[] => {
//   const results: ICalEventData[] = []

//   const firstItem = occurrences[0]!

//   const attrs = getEventAttrs(now, firstItem, options)

//   results.push(attrs)

//   if (occurrences.length > 1) {
//     const ruleSet = new RRuleSet()

//     ruleSet.rrule(
//       new RRule({
//         freq: RRule.DAILY,
//         count: 1,
//       }),
//     )

//     for (const extraOcc of occurrences.slice(1)) {
//       if (extraOcc.startDate) {
//         ruleSet.rdate(extraOcc.startDate.toDate())

//         const overrideAttrs = getEventAttrs(now, extraOcc, options)
//         overrideAttrs.recurrenceId = extraOcc.startDate.toDate()

//         results.push(overrideAttrs)
//       }
//     }

//     attrs.repeating = ruleSet
//   }

//   return results
// }

// const getEventAttrs = (
//   now: Date,
//   item: ScheduleEvent,
//   options: CreateICSOptions,
// ): ICalEventData => {
//   const attrs: ICalEventData = {
//     id: `${options.prefix}-${item.id}@${options.domain}`,
//     start: item.startDate ?? options.defaultStartDate,
//     end: item.startDate ?? options.defaultEndDate,
//     lastModified: now,
//     timezone: options.timeZone,
//   }

//   if (item.name) {
//     attrs.summary = item.name
//   }

//   if (item.description) {
//     attrs.description = item.description
//   }

//   if (item.location && item.location.length > 0) {
//     attrs.location = item.location.join(", ")
//     // TODO: stringify locations properly
//   }

//   return attrs
// }
