import {
  Box,
  Text,
  useProps,
  type BoxProps,
  type TextProps,
} from "@mantine/core"
import clsx from "clsx"
import { createContext, use, type ReactNode } from "react"
import { useDefaultCalendarRange } from "./hooks.js"

import classes from "./calendar.module.scss"
import { Track, type TrackItemProps, type TrackProps } from "./track.js"
import type { Dayjs } from "dayjs"

const CalendarContext = createContext<
  Readonly<
    | {
        startDate: Dayjs
        endDate: Dayjs
        orientation: "horizontal" | "vertical"
      }
    | undefined
  >
>(undefined)

export type CalendarProps = BoxProps & {
  classNames?: {
    root?: string | undefined
    vertical?: string | undefined
    horizontal?: string | undefined
  }
  startDate?: Dayjs | undefined
  endDate?: Dayjs | undefined
  orientation?: "horizontal" | "vertical" | undefined
  dayChangeHour?: number | undefined
  children?: ReactNode
}

/**
 * Base calendar display component.
 */
const _Calendar = (props: CalendarProps) => {
  const {
    className,
    classNames,
    startDate: startProp,
    endDate: endProp,
    orientation: orientationProp,
    dayChangeHour,
    children,
    ...other
  } = useProps("Calendar", null, props)

  const { startDate: defaultStart, endDate: defaultEnd } =
    useDefaultCalendarRange(dayChangeHour)
  const startDate = startProp ?? defaultStart
  const endDate = endProp ?? defaultEnd
  const orientation = orientationProp ?? "vertical"

  return (
    <Box
      className={clsx(
        "Calendar-root",
        classes.root,
        orientation == "horizontal"
          ? ["Calendar-horizontal", classes.horizontal, classNames?.horizontal]
          : ["Calendar-vertical", classes.vertical, classNames?.vertical],
        classNames?.root,
        className,
      )}
      {...other}
    >
      <CalendarContext.Provider
        value={{ startDate: startDate, endDate: endDate, orientation }}
      >
        {children}
      </CalendarContext.Provider>
    </Box>
  )
}

export type CalendarTimesProps = BoxProps & { children?: ReactNode }

export const CalendarTimes = (props: CalendarTimesProps) => {
  const { className, ...other } = useProps("CalendarTimes", null, props)

  return (
    <Box
      className={clsx("Calendar-times", classes.times, className)}
      {...other}
    />
  )
}

export type CalendarTimeProps = TextProps & { children?: ReactNode }

export const CalendarTime = (props: CalendarTimesProps) => {
  const { className, ...other } = useProps("CalendarTime", null, props)

  return (
    <Text
      component="span"
      size="sm"
      className={clsx("Calendar-time", classes.time, className)}
      {...other}
    />
  )
}

export type CalendarMarksProps = BoxProps & { children?: ReactNode }

export const CalendarMarks = (props: CalendarMarksProps) => {
  const { className, ...other } = useProps("CalendarMarks", null, props)

  return (
    <Box
      className={clsx("Calendar-marks", classes.marks, className)}
      {...other}
    />
  )
}

export type CalendarMarkProps = BoxProps

export const CalendarMark = (props: CalendarMarkProps) => {
  const { className, ...other } = useProps("CalendarMark", null, props)

  return (
    <Box
      className={clsx("Calendar-mark", classes.mark, className)}
      {...other}
    />
  )
}

export type CalendarHeadersProps = BoxProps & { children?: ReactNode }

export const CalendarHeaders = (props: CalendarHeadersProps) => {
  const { className, ...other } = useProps("CalendarTrackHeaders", null, props)

  return (
    <Box
      className={clsx("Calendar-headers", classes.headers, className)}
      {...other}
    />
  )
}

export type CalendarHeaderProps = TextProps & { children?: ReactNode }

export const CalendarHeader = (props: CalendarHeaderProps) => {
  const { className, ...other } = useProps("CalendarHeader", null, props)

  return (
    <Text
      component="span"
      className={clsx("Calendar-header", classes.header, className)}
      {...other}
    />
  )
}

export type CalendarBackgroundsProps = BoxProps & { children?: ReactNode }

export const CalendarBackgrounds = (props: CalendarBackgroundsProps) => {
  const { className, ...other } = useProps("CalendarBackgrounds", null, props)

  return (
    <Box
      className={clsx("Calendar-backgrounds", classes.backgrounds, className)}
      {...other}
    />
  )
}

export type CalendarBackgroundProps = BoxProps

export const CalendarBackground = (props: CalendarBackgroundProps) => {
  const { className, ...other } = useProps("CalendarBackground", null, props)

  return (
    <Box
      className={clsx("Calendar-background", classes.background, className)}
      {...other}
    />
  )
}

export type CalendarTracksProps = BoxProps & { children?: ReactNode }

export const CalendarTracks = (props: CalendarTracksProps) => {
  const { className, ...other } = useProps("CalendarTracks", null, props)

  return (
    <Box
      className={clsx("Calendar-tracks", classes.tracks, className)}
      {...other}
    />
  )
}

export type CalendarTrackProps = Omit<
  TrackProps,
  "startDate" | "endDate" | "orientation"
>

export const CalendarTrack = (props: CalendarTrackProps) => {
  const { className, ...other } = useProps("CalendarTrack", null, props)

  const ctx = use(CalendarContext)
  if (!ctx) {
    throw new Error("Calendar.Track used outside of Calendar")
  }
  const { startDate: start, endDate: end, orientation } = ctx

  return (
    <Track
      startDate={start}
      endDate={end}
      orientation={orientation}
      className={clsx("Calendar-track", classes.track, className)}
      {...other}
    />
  )
}

export type CalendarItemProps = TrackItemProps

export const CalendarItem = (props: CalendarItemProps) => {
  const { className, ...other } = useProps("CalendarItem", null, props)

  return (
    <Track.Item
      className={clsx("Calendar-item", classes.item, className)}
      {...other}
    />
  )
}

export const Calendar = Object.assign(_Calendar, {
  Backgrounds: CalendarBackgrounds,
  Background: CalendarBackground,
  Marks: CalendarMarks,
  Mark: CalendarMark,
  Times: CalendarTimes,
  Time: CalendarTime,
  Headers: CalendarHeaders,
  Header: CalendarHeader,
  Tracks: CalendarTracks,
  Track: CalendarTrack,
  Item: CalendarItem,
})
