import { Box, useProps, type BoxProps } from "@mantine/core"
import clsx from "clsx"
import { createContext, useContext, type ReactNode } from "react"

export type CalendarContextValue = Readonly<{
  start: Date
  end: Date
}>

export const CalendarContext = createContext<CalendarContextValue>({
  start: new Date(),
  end: new Date(),
})

export type CalendarProps = CalendarRootProps & {
  start: Date
  end: Date
}

export const Calendar = (props: CalendarProps) => {
  const { start, end, ...other } = props

  return (
    <CalendarContext value={{ start, end }}>
      <Calendar.Root {...other} />
    </CalendarContext>
  )
}

export type CalendarRootProps = {
  orientation?: "vertical" | "horizontal"
  numTracks?: number
  numCells?: number
  children?: ReactNode
} & BoxProps

const Root = (props: CalendarRootProps) => {
  const {
    className,
    orientation = "vertical",
    numTracks = 0,
    numCells = 0,
    ...other
  } = useProps("CalendarRoot", {}, props)

  return (
    <Box
      className={clsx(
        "Calendar-root",
        {
          "Calendar-vertical": orientation == "vertical",
          "Calendar-horizontal": orientation == "horizontal",
        },
        className,
      )}
      {...other}
      style={{
        ...other.style,
        "--num-tracks": numTracks,
        "--num-cells": numCells,
      }}
    />
  )
}

export type CalendarBackgroundProps = {
  numTracks?: number
} & Omit<BoxProps, "children">

const Background = (props: CalendarBackgroundProps) => {
  const {
    className,
    numTracks = 0,
    ...other
  } = useProps("CalendarBackground", {}, props)

  const els = []
  for (let i = 0; i < numTracks; i++) {
    els.push(<Box key={i} className="Calendar-trackBackground" />)
  }

  return (
    <Box
      className={clsx("Calendar-content", "Calendar-trackSpacing", className)}
      {...other}
    >
      {els}
    </Box>
  )
}

export type CalendarMarksProps = {
  numMarks?: number
} & Omit<BoxProps, "children">

const Marks = (props: CalendarMarksProps) => {
  const {
    className,
    numMarks = 0,
    ...other
  } = useProps("CalendarMarks", {}, props)

  const els = []
  for (let i = 0; i < numMarks; i++) {
    els.push(<Box key={i} className="Calendar-mark" />)
  }

  return (
    <Box
      className={clsx("Calendar-content", "Calendar-markSpacing", className)}
      {...other}
    >
      {els}
    </Box>
  )
}

export type CalendarLabelsProps = { children?: ReactNode } & BoxProps

const Labels = (props: CalendarLabelsProps) => {
  const { className, ...other } = useProps("CalendarLabels", {}, props)

  return (
    <Box
      className={clsx("Calendar-labels", "Calendar-markSpacing", className)}
      {...other}
    />
  )
}

export type CalendarLabelProps = { children?: ReactNode } & BoxProps

const Label = (props: CalendarLabelProps) => {
  const { className, ...other } = useProps("CalendarLabel", {}, props)

  return <Box className={clsx("Calendar-label", className)} {...other} />
}

export type CalendarTracksProps = { children?: ReactNode } & BoxProps

const Tracks = (props: CalendarTracksProps) => {
  const { className, ...other } = useProps("CalendarTracks", {}, props)

  return (
    <Box
      className={clsx("Calendar-tracks", "Calendar-trackSpacing", className)}
      {...other}
    />
  )
}

export type CalendarTrackProps = { children?: ReactNode } & BoxProps

const Track = (props: CalendarTrackProps) => {
  const { className, ...other } = useProps("CalendarTrack", {}, props)

  return <Box className={clsx("Calendar-track", className)} {...other} />
}

export type CalendarTrackHeaderProps = { children?: ReactNode } & BoxProps

const TrackHeader = (props: CalendarTrackHeaderProps) => {
  const { className, ...other } = useProps("CalendarTrackHeader", {}, props)

  return (
    <Box
      className={clsx(
        "Calendar-trackHeader",
        "Calendar-headerTitle",
        className,
      )}
      {...other}
    />
  )
}

export type CalendarTrackContentProps = { children?: ReactNode } & BoxProps

const TrackContent = (props: CalendarTrackContentProps) => {
  const { className, ...other } = useProps("CalendarTrackContent", {}, props)

  return (
    <Box
      className={clsx(
        "Calendar-trackContent",
        "Calendar-trackItems",
        className,
      )}
      {...other}
    />
  )
}

export type CalendarTrackItemProps = {
  children?: ReactNode
  start?: Date
  end?: Date
} & BoxProps

const TrackItem = (props: CalendarTrackItemProps) => {
  const { className, start, end, ...other } = useProps(
    "CalendarTrackItem",
    {},
    props,
  )

  const styleProps = useTrackItemInset(start, end)

  return (
    <Box
      className={clsx("Calendar-trackItem", className)}
      {...other}
      style={{ ...other.style, ...styleProps }}
    />
  )
}

Calendar.Root = Root
Calendar.Background = Background
Calendar.Marks = Marks
Calendar.Labels = Labels
Calendar.Label = Label
Calendar.Tracks = Tracks
Calendar.Track = Track
Calendar.TrackHeader = TrackHeader
Calendar.TrackContent = TrackContent
Calendar.TrackItem = TrackItem

const useTrackItemInset = (
  start?: Date,
  end?: Date,
): Record<string, string> => {
  const { start: trackStart, end: trackEnd } = useContext(CalendarContext)
  const trackStartT = trackStart.getTime()
  const trackEndT = trackEnd.getTime()
  const range = trackEndT - trackStartT
  const startT = start?.getTime()
  const endT = end?.getTime()

  let startPct: string
  let endPct: string

  if (startT != null && startT >= trackStartT) {
    startPct = `${(100 * (startT - trackStartT)) / range}%`
  } else {
    startPct = "0%"
  }

  if (endT != null && endT <= trackEndT) {
    endPct = `${(100 * (trackEndT - endT)) / range}%`
  } else {
    endPct = "0%"
  }

  return {
    "--item-start": startPct,
    "--item-end": endPct,
  }
}
