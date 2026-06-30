import { Box, useProps } from "@mantine/core"
import {
  getDefaultDay,
  iterToArr,
  makeDateFilter,
  type Day,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { DayFilter } from "../filters/day-filter.js"
import { useMemo } from "react"
import { Gantt, type GanttBarProps, type GanttTrack } from "../gantt/gantt.js"

import classes from "./gantt.module.scss"
import dayjs, { Dayjs } from "dayjs"

export type GanttViewProps = {
  className?: string
  items?: Iterable<ScheduleItem>
  now?: Dayjs
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
  } = useProps("GanttView", { now: dayjs() }, props)

  const defaultDay = getDefaultDay(days ?? [], now)

  const dayFiltered = useMemo(() => {
    const day = selectedDay ?? defaultDay
    if (day) {
      const filter = makeDateFilter(day)
      return [...(items ?? [])]
        .filter(
          (
            item,
          ): item is ScheduleItem & {
            readonly startDate: Dayjs
            readonly endDate: Dayjs
          } =>
            "startDate" in item &&
            !!item.startDate &&
            "endDate" in item &&
            !!item.endDate,
        )
        .filter(filter)
    } else {
      return []
    }
  }, [items, selectedDay ?? defaultDay, days])

  const tracks = useMemo(() => {
    const res: GanttTrack[] = []
    for (const loc of locations ?? []) {
      // TODO: new location matching
      const items = dayFiltered
        .filter(
          (item) =>
            "location" in item && item.location && item.location.includes(loc),
        )
        .map(
          (item): GanttBarProps => ({
            startDate: item.startDate,
            endDate: item.endDate,
            children:
              "ganttTitle" in item && typeof item.ganttTitle == "string"
                ? item.ganttTitle
                : undefined,
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
      if (first?.startDate && (!start || first.startDate.isBefore(start))) {
        start = first.startDate
      }

      const last = trackArr[trackArr.length - 1]
      if (last?.endDate && (!end || last.endDate.isAfter(end))) {
        end = last.endDate
      }
    }

    if (start) {
      start = start.set("minute", 0).set("second", 0).set("millisecond", 0)
    }

    if (end) {
      if (end.minute() > 0 || end.second() > 0 || end.millisecond() > 0) {
        end = end.add(1, "hour")
      }

      end = end.set("minute", 0).set("second", 0).set("millisecond", 0)
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
        startDate={start ?? day?.startDate}
        endDate={end ?? day?.endDate}
      />
    </Box>
  )
}
