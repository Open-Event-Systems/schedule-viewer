import { Box, Text, useProps } from "@mantine/core"
import clsx, { type ClassValue } from "clsx"
import {
  Calendar,
  CalendarItem,
  type CalendarItemProps,
  type CalendarProps,
} from "../calendar/calendar.js"
import { type ComponentType, type ReactNode } from "react"
import {
  useCalendarMarks,
  useCalendarTimes,
  useDefaultCalendarRange,
} from "../calendar/hooks.js"

import classes from "./gantt.module.scss"
import type { TrackItemProps } from "../calendar/track.js"

export type GanttTrack = Readonly<{
  id: string
  name?: ReactNode
  items?: Iterable<CalendarItemProps>
}>

export type GanttProps = Omit<GanttRootProps, "children"> & {
  tracks?: Iterable<GanttTrack>
  renderBar?: (props: TrackItemProps) => ReactNode
}

const _Gantt = (props: GanttProps) => {
  const {
    tracks,
    startDate: startProp,
    endDate: endProp,
    dayChangeHour,
    renderBar,
    ...other
  } = useProps("Gantt", null, props)

  const { startDate: defaultStart, endDate: defaultEnd } =
    useDefaultCalendarRange(dayChangeHour)

  const start = startProp ?? defaultStart
  const end = endProp ?? defaultEnd

  const times = useCalendarTimes(start, end).map((t, i) => (
    <Gantt.Time key={i}>{t}</Gantt.Time>
  ))

  const marks = useCalendarMarks(start, end).map((p, i) => (
    <Gantt.Mark key={i} {...p} />
  ))

  const headers = []
  const trackEls = []
  const backgroundEls = []

  for (const track of tracks ?? []) {
    backgroundEls.push(<Gantt.Background key={track.id} />)
    headers.push(<Gantt.Header key={track.id}>{track.name}</Gantt.Header>)
    const trackItems = []

    let idx = 0
    for (const item of track.items ?? []) {
      trackItems.push(<Gantt.Bar key={idx} renderRoot={renderBar} {...item} />)
      idx++
    }

    trackEls.push(<Gantt.Track key={track.id}>{trackItems}</Gantt.Track>)
  }

  return (
    <Gantt.Root
      startDate={start}
      endDate={end}
      {...other}
      style={{
        "--num-times": times.length,
        ...other.style,
      }}
    >
      <Gantt.Backgrounds>{backgroundEls}</Gantt.Backgrounds>
      <Gantt.Marks>{marks}</Gantt.Marks>
      <Gantt.Tracks>{trackEls}</Gantt.Tracks>
      <Gantt.Headers>{headers}</Gantt.Headers>
      <Gantt.Times>{times}</Gantt.Times>
    </Gantt.Root>
  )
}

export type GanttRootProps = CalendarProps

export const GanttRoot = (props: GanttRootProps) => {
  const { className, classNames, ...other } = useProps("GanttRoot", null, props)

  return (
    <Calendar
      className={clsx("Gantt-root", classes.root, className)}
      classNames={{
        horizontal: clsx(classes.horizontal, classNames?.horizontal),
        vertical: clsx(classes.vertical, classNames?.vertical),
      }}
      {...other}
    />
  )
}

export type GanttBarProps = CalendarItemProps & {
  color?: string
}

export const GanttBar = (props: GanttBarProps) => {
  const { className, color, children, ...other } = useProps(
    "GanttBar",
    null,
    props,
  )

  return (
    <CalendarItem
      className={clsx("Gantt-bar", classes.bar, className)}
      {...other}
      style={{
        ...(color && { "--bar-color": color }),
        ...props.style,
      }}
    >
      <Box className={clsx("Gantt-node", classes.node)}></Box>
      <Text component="div" className={clsx("Gantt-barBody", classes.barBody)}>
        {children}
      </Text>
      <Box className={clsx("Gantt-node", classes.node)}></Box>
    </CalendarItem>
  )
}

const compose = <P extends { className?: string }>(
  C: ComponentType<P>,
  name: string,
  classes?: ClassValue,
): ComponentType<P> => {
  const wrapped = (props: P) => {
    return <C {...props} className={clsx(props.className, classes)} />
  }

  wrapped.displayName = name

  return wrapped
}

export const Gantt = Object.assign(_Gantt, {
  Root: GanttRoot,
  Backgrounds: compose(Calendar.Backgrounds, "GanttBackgrounds"),
  Background: compose(Calendar.Background, "GanttBackground"),
  Marks: compose(Calendar.Marks, "GanttMarks"),
  Mark: compose(Calendar.Mark, "GanttMark"),
  Times: compose(Calendar.Times, "GanttTimes"),
  Time: compose(Calendar.Time, "GanttTime"),
  Headers: compose(Calendar.Headers, "GanttHeaders"),
  Header: compose(Calendar.Header, "GanttHeader", classes.header),
  Tracks: compose(Calendar.Tracks, "GanttTracks"),
  Track: compose(Calendar.Track, "GanttTrack", classes.track),
  Bar: GanttBar,
})
