import { Box, useProps, type BoxProps } from "@mantine/core"
import {
  Calendar,
  CalendarContext,
  type CalendarRootProps,
} from "../calendar/calendar.js"
import clsx from "clsx"
import type { ReactNode } from "react"

export type GanttProps = {
  start: Date
  end: Date
} & GanttRootProps

export const Gantt = (props: GanttProps) => {
  const { start, end, ...other } = props
  return (
    <CalendarContext value={{ start, end }}>
      <Gantt.Root {...other} />
    </CalendarContext>
  )
}

export type GanttRootProps = {
  orientation?: "vertical" | "horizontal"
} & CalendarRootProps

const Root = (props: GanttRootProps) => {
  const { className, ...other } = useProps("GanttRoot", {}, props)

  return <Calendar.Root className={clsx("Gantt-root", className)} {...other} />
}

export type GanttBarLabelProps = { children?: ReactNode } & BoxProps

const Label = (props: GanttBarLabelProps) => {
  const { className, ...other } = useProps("GanttBarLabel", {}, props)

  return <Box className={clsx("Gantt-barLabel", className)} {...other} />
}

Gantt.Root = Root
Gantt.BarLabel = Label
