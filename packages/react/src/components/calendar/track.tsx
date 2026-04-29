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

const TrackContext = createContext<
  | Readonly<{ start: Date; end: Date; orientation: "horizontal" | "vertical" }>
  | undefined
>(undefined)

export type TrackProps = BoxProps & {
  classNames?: {
    root?: string
    horizontal?: string
    vertical?: string
  }
  start?: Date | null
  end?: Date | null
  dayChangeHour?: number
  orientation?: "horizontal" | "vertical"
  children?: ReactNode
  renderRoot?: (
    props: Omit<AllHTMLAttributes<HTMLElement>, "start">,
  ) => ReactNode
} & Omit<AllHTMLAttributes<HTMLElement>, "start">

/**
 * Displays items positioned by date along a track.
 */
const _Track = (props: TrackProps) => {
  const {
    className,
    classNames,
    start: startProp,
    end: endProp,
    dayChangeHour,
    orientation: orientationProp,
    children,
    renderRoot,
    ...other
  } = useProps("Track", null, props)

  const [defautStart, defaultEnd] = useDefaultCalendarRange(dayChangeHour)
  const start = startProp ?? defautStart
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
      <TrackContext.Provider value={{ start, end, orientation }}>
        {children}
      </TrackContext.Provider>
    </Box>
  )
}

export type TrackItemProps = BoxProps & {
  start?: Date | null
  end?: Date | null
  children?: ReactNode
  renderRoot?: (
    props: Omit<AllHTMLAttributes<HTMLElement>, "start">,
  ) => ReactNode
} & Omit<AllHTMLAttributes<HTMLElement>, "start">

export const TrackItem = (props: TrackItemProps) => {
  const { className, start, end, children, renderRoot, ...other } = useProps(
    "TrackItem",
    null,
    props,
  )

  const ctx = use(TrackContext)

  if (!ctx) {
    throw new Error("Track.Item used outside of Track")
  }
  const { start: trackStart, end: trackEnd } = ctx

  const [startInset, endInset] = useCalendarTrackInsets(
    trackStart,
    trackEnd,
    start,
    end,
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
