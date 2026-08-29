import { Box, useProps, type BoxProps } from "@mantine/core"
import {
  createContext,
  use,
  type AllHTMLAttributes,
  type ReactNode,
} from "react"
import { useCalendarTrackInsets, useDefaultCalendarRange } from "./hooks.js"
import clsx from "clsx"

import classes from "./track.module.scss"
import type { Dayjs } from "dayjs"

const TrackContext = createContext<
  | Readonly<{
      startDate: Dayjs
      endDate: Dayjs
      orientation: "horizontal" | "vertical"
    }>
  | undefined
>(undefined)

export type TrackProps = BoxProps & {
  classNames?: {
    root?: string | undefined
    horizontal?: string | undefined
    vertical?: string | undefined
  }
  startDate?: Dayjs | undefined | null
  endDate?: Dayjs | undefined | null
  dayChangeHour?: number | undefined
  orientation?: "horizontal" | "vertical" | undefined
  children?: ReactNode
  renderRoot?:
    ((props: AllHTMLAttributes<HTMLElement>) => ReactNode) | undefined
} & AllHTMLAttributes<HTMLElement>

/**
 * Displays items positioned by date along a track.
 */
const _Track = (props: TrackProps) => {
  const {
    className,
    classNames,
    startDate: startProp,
    endDate: endProp,
    dayChangeHour,
    orientation: orientationProp,
    children,
    renderRoot,
    ...other
  } = useProps("Track", null, props)

  const { startDate: defaultStart, endDate: defaultEnd } =
    useDefaultCalendarRange(dayChangeHour)
  const start = startProp ?? defaultStart
  const end = endProp ?? defaultEnd
  const orientation = orientationProp ?? "vertical"

  return (
    <Box
      className={clsx(
        "Track-root",
        classes.root,
        classNames?.root,
        orientation == "horizontal"
          ? ["Track-horizontal", classes.horizontal, classNames?.horizontal]
          : ["Track-vertical", classes.vertical, classNames?.vertical],
        className,
      )}
      renderRoot={renderRoot}
      {...other}
    >
      <TrackContext.Provider
        value={{ startDate: start, endDate: end, orientation }}
      >
        {children}
      </TrackContext.Provider>
    </Box>
  )
}

export type TrackItemProps = BoxProps & {
  startDate?: Dayjs | undefined | null
  endDate?: Dayjs | undefined | null
  children?: ReactNode
  renderRoot?:
    | ((props: Omit<AllHTMLAttributes<HTMLElement>, "start">) => ReactNode)
    | undefined
} & Omit<AllHTMLAttributes<HTMLElement>, "start">

export const TrackItem = (props: TrackItemProps) => {
  const { className, startDate, endDate, children, renderRoot, ...other } =
    useProps("TrackItem", null, props)

  const ctx = use(TrackContext)

  if (!ctx) {
    throw new Error("Track.Item used outside of Track")
  }
  const { startDate: trackStart, endDate: trackEnd } = ctx

  const [startInset, endInset] = useCalendarTrackInsets(
    trackStart,
    trackEnd,
    startDate,
    endDate,
  )

  return (
    <Box
      className={clsx("Track-item", classes.item, className)}
      renderRoot={renderRoot}
      {...other}
      style={{
        "--start-inset": startInset,
        "--end-inset": endInset,
        ...other.style,
      }}
    >
      {children}
    </Box>
  )
}

export const Track = Object.assign(_Track, {
  Item: TrackItem,
})
