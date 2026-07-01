/**
 * Date parsing/formatting utils.
 * @module
 */

import dayjs from "dayjs"
import utcPlugin from "dayjs/plugin/utc.js"
import tzPlugin from "dayjs/plugin/timezone.js"
import type { Interval } from "./types.js"

dayjs.extend(utcPlugin)
dayjs.extend(tzPlugin)

/**
 * Parse an ISO 8601 datetime string, preserving UTC offset.
 */
export const parseISO = (isoStr: string): dayjs.Dayjs => {
  let res = dayjs(isoStr)

  const offset = getOffset(isoStr)
  if (offset) {
    res = res.utcOffset(offset)
  }

  return res
}

/**
 * Format a {@link dayjs.Dayjs} instance, including ms.
 */
export const formatISO = (d: dayjs.Dayjs): string => {
  if (d.millisecond() > 0) {
    return d.format("YYYY-MM-DDTHH:mm:ss.SSSZ")
  } else {
    return d.format("YYYY-MM-DDTHH:mm:ssZ")
  }
}

/**
 * Changes an {@link Interval} to be in a specific time zone.
 */
export const intervalToTz = <T extends Interval>(
  timeZone: string,
  interval: T,
): T => {
  let { startDate, endDate } = interval

  if (startDate) {
    startDate = startDate.tz(timeZone)
  }

  if (endDate) {
    endDate = endDate.tz(timeZone)
  }

  return {
    ...interval,
    startDate,
    endDate,
  }
}

const offsetPattern = /([+-])([0-9]{2}):?([0-9]{2})$/

const getOffset = (isoStr: string): number | undefined => {
  if (isoStr.endsWith("Z")) {
    return 0
  }

  const match = offsetPattern.exec(isoStr)
  if (match) {
    const sign = match[1] == "-" ? -1 : 1
    const hours = parseInt(match[2]!)
    const minutes = parseInt(match[3]!)
    return sign * (hours * 60 + minutes)
  }
}
