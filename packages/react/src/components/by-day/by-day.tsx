import { Box, useProps } from "@mantine/core"
import type { DefaultBoxProps } from "../types.js"
import clsx from "clsx"
import { DayFilter } from "../filters/day-filter.js"
import type { Day } from "@open-event-systems/schedule-lib"

import classes from "./by-day.module.scss"

export type ByDayViewProps = {
  days?: Iterable<Day> | undefined
  dayFormat?: string | undefined
  selectedDay?: string | undefined
  getHref?: (day: Day) => string | undefined
  onSelectDay?: ((day: Day) => void) | undefined
} & DefaultBoxProps

export const ByDayView = (props: ByDayViewProps) => {
  const {
    className,
    children,
    days,
    dayFormat,
    selectedDay,
    getHref,
    onSelectDay,
    ...other
  } = useProps("ByDayView", null, props)

  return (
    <Box className={clsx("ByDayView-root", classes.root, className)} {...other}>
      <DayFilter
        className={classes.dayFilter}
        days={days}
        dayFormat={dayFormat}
        selectedDay={selectedDay}
        getHref={getHref}
        onSelectDay={onSelectDay}
      />
      {children}
    </Box>
  )
}
