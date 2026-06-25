import { type Dayjs } from "dayjs"
import type { Day, Interval } from "./types.js"

/**
 * Return whether an interval contains a date.
 */
export const contains = (
  interval: Interval,
  d: Dayjs,
  includeEndpoint = false,
): boolean => {
  return (
    (!interval.startDate || !d.isBefore(interval.startDate)) &&
    (!interval.endDate ||
      d.isBefore(interval.endDate) ||
      (!!includeEndpoint && d.isSame(interval.endDate)))
  )
}

/**
 * Return whether two intervals intersect.
 */
export const intersects = (a: Interval, b: Interval): boolean => {
  return (
    (!!b.startDate && contains(a, b.startDate)) ||
    (!!a.startDate && contains(b, a.startDate)) ||
    (!a.startDate && !b.startDate)
  )
}

/**
 * Sort an array of intervals by start date, in place.
 *
 * Undefined start dates are before all defined start dates.
 */
export const sortIntervalsByStartDate = <
  T extends { readonly startDate?: Dayjs }[],
>(
  arr: T,
): T => {
  arr.sort((a, b) => {
    if (a.startDate && b.startDate) {
      if (a.startDate.isBefore(b.startDate)) {
        return -1
      } else if (a.startDate.isAfter(b.startDate)) {
        return 1
      } else {
        return 0
      }
    } else if (!a.startDate && b.startDate) {
      return -1
    } else if (a.startDate && !b.startDate) {
      return 1
    } else {
      return 0
    }
  })
  return arr
}

/**
 * Get an interval representing the day a date occurs on, subject to the day
 * change hour.
 */
export const getDay = (d: Dayjs, dayChangeHour = 0): Day => {
  const shifted = d.subtract(dayChangeHour, "hour")
  const start = shifted
    .set("hour", dayChangeHour)
    .set("minute", 0)
    .set("second", 0)
    .set("millisecond", 0)
  const key = start.format("YYYY-MM-DD")

  return { key, startDate: start, endDate: start.add(1, "day") }
}

/**
 * Get the days for a collection of items. The items must be sorted by start
 * date.
 */
export const getDays = (
  items?: Iterable<{ readonly startDate: Dayjs }>,
  dayChangeHour?: number,
): readonly Day[] => {
  const startDates = []

  for (const item of items ?? []) {
    if (item.startDate) {
      startDates.push(item.startDate)
    }
  }

  const first = startDates[0]
  const last = startDates[startDates.length - 1]

  if (!first || !last) {
    return []
  }

  const firstDay = getDay(first, dayChangeHour)

  const days = []

  let cur = firstDay
  let curEndTime = firstDay.endDate.valueOf()

  while (startDates.length > 0) {
    let endIdx = startDates.findIndex((t) => t.valueOf() >= curEndTime)
    if (endIdx == -1) {
      endIdx = startDates.length
    }

    if (endIdx > 0) {
      startDates.splice(0, endIdx)
      days.push(cur)
    }

    const next = startDates[0]
    if (next) {
      cur = getDay(next, dayChangeHour)
      curEndTime = cur.endDate.valueOf()
    }
  }
  return days
}

/**
 * Get the current day from an iterable of days.
 */
export const getDefaultDay = (
  days: Iterable<Day>,
  now: Dayjs,
): Day | undefined => {
  const daysArr = [...days]

  if (daysArr.length == 0) {
    return
  }

  for (const day of days) {
    if (contains(day, now)) {
      return day
    }
  }

  const lastDay = daysArr[daysArr.length - 1]

  if (lastDay && !now.isBefore(lastDay.endDate)) {
    return lastDay
  } else {
    return daysArr[0]
  }
}
