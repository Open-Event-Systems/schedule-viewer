import {
  getDay,
  type Bounded,
  type Interval,
} from "@open-event-systems/schedule-lib"
import { useState } from "react"
import type { CalendarMarkProps } from "./calendar.js"
import dayjs, { Dayjs } from "dayjs"

export const useDefaultCalendarRange = (
  dayChangeHour = 0,
): Bounded<Interval> => {
  return useState((): Bounded<Interval> => {
    const now = dayjs()

    const day = getDay(now, dayChangeHour)
    return { startDate: day.startDate, endDate: day.endDate }
  })[0]
}

export const useCalendarTrackInsets = (
  trackStart: Dayjs,
  trackEnd: Dayjs,
  startDate?: Dayjs | null,
  endDate?: Dayjs | null,
): [string, string] => {
  const trackStartTime = trackStart.unix()
  const trackRange = trackEnd.unix() - trackStartTime

  let startPct = 0
  let endPct = 0

  if (startDate != null) {
    startPct = Math.max((startDate.unix() - trackStartTime) / trackRange, 0)
  }

  if (endDate != null) {
    endPct = Math.max(1 - (endDate.unix() - trackStartTime) / trackRange, 0)
  }

  return [`${100 * startPct}%`, `${100 * endPct}%`]
}

export const useCalendarTimes = (
  startDate: Dayjs,
  endDate: Dayjs,
): string[] => {
  const res = []
  let cur = startDate

  while (!cur.isAfter(endDate)) {
    res.push(cur.format("h a"))
    cur = cur.add(1, "hour")
  }

  return res
}

export const useCalendarMarks = (
  startDate: Dayjs,
  endDate: Dayjs,
  minorDivisions = 1,
): Partial<CalendarMarkProps>[] => {
  const res = []

  let cur = startDate
  while (!cur.isAfter(endDate)) {
    res.push({})

    if (!cur.isSame(endDate)) {
      for (let i = 0; i < minorDivisions; ++i) {
        res.push({})
      }
    }

    cur = cur.add(1, "hour")
  }

  return res
}
