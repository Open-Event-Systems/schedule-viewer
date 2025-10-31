import { ActionIcon, Box, type BoxProps, Select, useProps } from "@mantine/core"
import clsx from "clsx"
import { format } from "date-fns"
import { useMemo } from "react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import type { Day } from "@open-event-systems/schedule-lib"

export type DayFilterProps = {
  days?: Iterable<Day>
  dayFormat?: string
  selectedDay?: string
  onSelectDay?: (day: Day) => void
} & BoxProps

const defaultDayFormat = "EEEE, MMM d"

export const DayFilter = (props: DayFilterProps) => {
  const {
    className,
    days = [],
    dayFormat = defaultDayFormat,
    selectedDay,
    onSelectDay,
    ...other
  } = useProps("DayFilter", {}, props)

  const { daysByKey, dayData } = useMemo(() => {
    const daysByKey = new Map<string, Day>()
    const dayData = []

    for (const day of days) {
      const label = format(day.start, dayFormat)
      daysByKey.set(day.key, day)
      dayData.push({ value: day.key, label })
    }

    return { daysByKey, dayData }
  }, [days, dayFormat])

  const selectedIdx = dayData.findIndex((o) => o.value == selectedDay)

  return (
    <Box className={clsx("DayFilter-root", className)} {...other}>
      <ActionIcon
        className="DayFilter-prev DayFilter-button"
        variant="subtle"
        title="Previous Day"
        disabled={selectedIdx <= 0}
        onClick={() => {
          const prevDayOpt = dayData[selectedIdx - 1]
          const prevDay = prevDayOpt
            ? daysByKey.get(prevDayOpt.value)
            : undefined
          prevDay && onSelectDay && onSelectDay(prevDay)
        }}
      >
        <IconChevronLeft />
      </ActionIcon>
      <Select
        className="DayFilter-select"
        classNames={{
          input: "DayFilter-selectInput",
        }}
        variant="unstyled"
        data={dayData}
        value={selectedDay}
        onChange={(v) => {
          if (v) {
            const day = daysByKey.get(v)
            day && onSelectDay && onSelectDay(day)
          }
        }}
        rightSection={null}
      />
      <ActionIcon
        className="DayFilter-next DayFilter-button"
        variant="subtle"
        title="Next Day"
        disabled={selectedIdx >= dayData.length - 1}
        onClick={() => {
          const nextDayOpt = dayData[selectedIdx + 1]
          const nextDay = nextDayOpt
            ? daysByKey.get(nextDayOpt.value)
            : undefined
          nextDay && onSelectDay && onSelectDay(nextDay)
        }}
      >
        <IconChevronRight />
      </ActionIcon>
    </Box>
  )
}
