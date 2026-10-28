/**
 * Item factories/utilities.
 */

import { occurrenceSchema, scheduleItemSchema } from "#src/parse/json.js"
import {
  type Occurrence,
  type ScheduleItem,
  type ScheduleItemBaseProps,
  type ScheduleItemOccurrence,
  type SeriesOrOccurrence,
} from "#src/types.js"
import { omitUndef } from "#src/utils.js"
import z from "zod"

/**
 * Make a {@link ScheduleItem} object.
 */
export const makeScheduleItem = (
  input: z.input<typeof scheduleItemSchema>,
): ScheduleItem => omitUndef(scheduleItemSchema.parse(input))

/**
 * Make a {@link Occurrence}.
 */
export const makeOccurrence = (
  input: z.input<typeof occurrenceSchema>,
): Occurrence => omitUndef(occurrenceSchema.parse(input))

/**
 * Transform a {@link ScheduleItemOccurrence} into a single element array of itself.
 */
export function toOccurrenceArray<
  T extends ScheduleItemBaseProps = ScheduleItem,
>(occ: ScheduleItemOccurrence<T>): [ScheduleItemOccurrence<T>]

/**
 * Transform a {@link SeriesOrOccurrence} into an array of {@link ScheduleItemOccurrence}.
 */
export function toOccurrenceArray<
  T extends ScheduleItemBaseProps = ScheduleItem,
>(obj: SeriesOrOccurrence<T>): ScheduleItemOccurrence<T>[]

export function toOccurrenceArray<
  T extends ScheduleItemBaseProps = ScheduleItem,
>(obj: SeriesOrOccurrence<T>): ScheduleItemOccurrence<T>[] {
  if (obj.occurrences) {
    // a series
    const occs: ScheduleItemOccurrence<T>[] = []

    for (const occ of obj.occurrences) {
      occs.push({
        ...occ,
        item: obj.item,
      })
    }

    return occs
  } else {
    // a single occurrence
    return [obj]
  }
}
