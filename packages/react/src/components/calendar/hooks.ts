import { getDay } from "@open-event-systems/schedule-lib"
import { add, format, isAfter, isEqual } from "date-fns"
import { useState } from "react"
import type { CalendarMarkProps } from "./calendar.js"

export const useDefaultCalendarRange = (dayChangeHour = 0): [Date, Date] => {
  return useState((): [Date, Date] => {
    const now = new Date()

    const day = getDay(now, dayChangeHour)
    return [day.start, day.end]
  })[0]
}

export const useCalendarTrackInsets = (
  trackStart: Date,
  trackEnd: Date,
  start?: Date | null,
  end?: Date | null,
): [string, string] => {
  const trackStartTime = trackStart.getTime()
  const trackRange = trackEnd.getTime() - trackStartTime

  let startPct = 0
  let endPct = 0

  if (start != null) {
    startPct = Math.max((start.getTime() - trackStartTime) / trackRange, 0)
  }

  if (end != null) {
    endPct = Math.max(1 - (end.getTime() - trackStartTime) / trackRange, 0)
  }

  return [`${100 * startPct}%`, `${100 * endPct}%`]
}

export const useCalendarTimes = (start: Date, end: Date): string[] => {
  const res = []
  let cur = start

  while (!isAfter(cur, end)) {
    res.push(format(cur, "h aaa"))
    cur = add(cur, { hours: 1 })
  }

  return res
}

export const useCalendarMarks = (
  start: Date,
  end: Date,
  minorDivisions = 1,
): Partial<CalendarMarkProps>[] => {
  const res = []

  let cur = start
  while (!isAfter(cur, end)) {
    res.push({})

    if (!isEqual(cur, end)) {
      for (let i = 0; i < minorDivisions; ++i) {
        res.push({})
      }
    }

    cur = add(cur, { hours: 1 })
  }

  return res
}
