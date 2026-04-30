import { Box, useProps } from "@mantine/core"
import {
  getDefaultDay,
  iterToArr,
  makeDateFilter,
  type Day,
  type DetailedScheduleItem,
} from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { DayFilter } from "../filters/day-filter.js"
import { useMemo } from "react"
import { Gantt, type GanttBarProps, type GanttTrack } from "../gantt/gantt.js"
import { add, isAfter, isBefore, set } from "date-fns"

import classes from "./gantt.module.scss"

export type GanttViewProps = {
  className?: string
  items?: Iterable<DetailedScheduleItem>
  now?: Date
  days?: Iterable<Day>
  selectedDay?: Day
  getDayHref?: (day: Day) => string | undefined
  onSelectDay?: (day: Day) => void
  dayFormat?: string
  locations?: Iterable<string>
}

export const GanttView = (props: GanttViewProps) => {
  const {
    className,
    items,
    now,
    days,
    selectedDay,
    getDayHref,
    onSelectDay,
    dayFormat,
    locations,
  } = useProps("GanttView", { now: new Date() }, props)

  const defaultDay = getDefaultDay(days ?? [], now)

  const dayFiltered = useMemo(() => {
    const day = selectedDay ?? defaultDay
    if (day) {
      const filter = makeDateFilter(day)
      return [...(items ?? [])].filter(filter)
    } else {
      return []
    }
  }, [items, selectedDay ?? defaultDay, days])

  const tracks = useMemo(() => {
    const res: GanttTrack[] = []
    for (const loc of locations ?? []) {
      const items = dayFiltered
        .filter((item) => item.location && item.location.includes(loc))
        .map(
          (item): GanttBarProps => ({
            start: item.start,
            end: item.end,
            renderRoot: (props) => (
              <div
                {...props}
                className={clsx(props.className, `Gantt-bar-id-${item.id}`)}
              />
            ),
          }),
        )

      const track = {
        id: loc,
        title: loc,
        items,
      }

      res.push(track)
    }

    return res
  }, [locations, dayFiltered])

  const [start, end] = useMemo(() => {
    let start
    let end

    for (const track of tracks) {
      const trackArr = iterToArr(track.items)
      const first = trackArr[0]
      if (first?.start && (!start || isBefore(first.start, start))) {
        start = first.start
      }

      const last = trackArr[trackArr.length - 1]
      if (last?.end && (!end || isAfter(last.end, end))) {
        end = last.end
      }
    }

    if (start) {
      start = set(start, { minutes: 0, seconds: 0, milliseconds: 0 })
    }

    if (end) {
      if (end.getMinutes() > 0) {
        end = add(end, { hours: 1 })
      }

      end = set(end, { minutes: 0, seconds: 0, milliseconds: 0 })
    }

    return [start, end]
  }, [tracks])

  const day = selectedDay ?? defaultDay

  return (
    <Box className={clsx("GanttView-root", classes.root, className)}>
      <DayFilter
        className="GanttView-dayFilter"
        days={days}
        selectedDay={selectedDay?.key ?? defaultDay?.key}
        getHref={getDayHref}
        onSelectDay={onSelectDay}
        dayFormat={dayFormat}
      />
      <Gantt
        className={clsx("GanttView-gantt", classes.gantt)}
        tracks={tracks}
        start={start ?? day?.start}
        end={end ?? day?.end}
      />
    </Box>
  )
}
