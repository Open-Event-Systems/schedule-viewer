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

const CalendarContext =
  createContext<
    Readonly<
      | { start: Date; end: Date; orientation: "horizontal" | "vertical" }
      | undefined
    >
  >(undefined)

export type CalendarProps = BoxProps & {
  classNames?: {
    root?: string
    vertical?: string
    horizontal?: string
  }
  start?: Date | null
  end?: Date | null
  orientation?: "horizontal" | "vertical"
  dayChangeHour?: number
  children?: ReactNode
}

/**
 * Base calendar display component.
 */
const _Calendar = (props: CalendarProps) => {
  const {
    className,
    classNames,
    start: startProp,
    end: endProp,
    orientation: orientationProp,
    dayChangeHour,
    children,
    ...other
  } = useProps("Calendar", null, props)

  const [defaultStart, defaultEnd] = useDefaultCalendarRange(dayChangeHour)
  const start = startProp ?? defaultStart
  const end = endProp ?? defaultEnd
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
      <CalendarContext.Provider value={{ start, end, orientation }}>
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
  "start" | "end" | "orientation"
>

export const CalendarTrack = (props: CalendarTrackProps) => {
  const { className, ...other } = useProps("CalendarTrack", null, props)

  const ctx = use(CalendarContext)
  if (!ctx) {
    throw new Error("Calendar.Track used outside of Calendar")
  }
  const { start, end, orientation } = ctx

  return (
    <Track
      start={start}
      end={end}
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
