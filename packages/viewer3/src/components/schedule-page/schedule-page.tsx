import { Box, useProps } from "@mantine/core"
import type { ScheduleItem } from "@open-event-systems/schedule-lib"
import type { DefaultBoxProps } from "@open-event-systems/schedule-react"
import clsx from "clsx"

export type ViewerSchedulePageProps = DefaultBoxProps & {
  name?: string
  description?: string
  items?: Iterable<ScheduleItem>
}

export const ViewerSchedulePage = (props: ViewerSchedulePageProps) => {
  const { className, name, description, items, ...other } = useProps(
    "ViewerSchedulePage",
    null,
    props,
  )

  return (
    <Box
      className={clsx("ViewerSchedulePage-root", className)}
      {...other}
    ></Box>
  )
}
