import { ActionIcon, Box, BoxProps, Title, useProps } from "@mantine/core"
import { getDay, toTimezone } from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { add, format, formatISO, isBefore } from "date-fns"
import { useMemo } from "react"
import { useScheduleConfig } from "../config/context.js"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

export type DayFilterProps = {
  events?: Iterable<Readonly<{ start?: Date | null }>>
  selectedDay?: string
  onSelectDay?: (day: string) => void
} & BoxProps

export const DayFilter = (props: DayFilterProps) => {
  const {
    className,
    events = [],
    selectedDay,
    onSelectDay,
    ...other
  } = useProps("DayFilter", {}, props)

  const eventsArr = useMemo(
    () =>
      Array.from(events).filter(
        (e): e is { readonly start: Date } => !!e.start
      ),
    [events]
  )

  const config = useScheduleConfig()

  const days = useMemo(
    () => getDays(eventsArr, config.dayChangeHour),
    [eventsArr, config.dayChangeHour]
  )

  const dayTitles = useMemo(() => getDayTitles(days), [days])
  let selectedIdx = days.findIndex(([s]) => s === selectedDay)
  if (selectedIdx == -1) {
    const defaultDay = getDefaultDayStr(days, config.timeZone)
    selectedIdx = days.findIndex(([s]) => s === defaultDay)
  }

  const selectedDayStr = days[selectedIdx][0]
  const selectedDayTitle = dayTitles.get(selectedDayStr)

  return (
    <Box className={clsx("DayFilter-root", className)} {...other}>
      <ActionIcon
        className="DayFilter-prev DayFilter-button"
        variant="subtle"
        title="Previous Day"
        color="var(--mantine-color-text)"
        disabled={selectedIdx <= 0}
        onClick={() => {
          onSelectDay && onSelectDay(days[selectedIdx - 1][0])
        }}
      >
        <IconChevronLeft />
      </ActionIcon>
      <Title order={5} className="DayFilter-title">
        {selectedDayTitle}
      </Title>
      <ActionIcon
        className="DayFilter-next DayFilter-button"
        variant="subtle"
        title="Next Day"
        color="var(--mantine-color-text)"
        disabled={selectedIdx >= days.length - 1}
        onClick={() => {
          onSelectDay && onSelectDay(days[selectedIdx + 1][0])
        }}
      >
        <IconChevronRight />
      </ActionIcon>
    </Box>
  )
}

const getDays = (
  events: Iterable<Readonly<{ start: Date }>>,
  dayChangeHour: number
): [string, Date][] => {
  const entries = new Map<string, Date>()
  for (const event of events) {
    const day = getDay(event.start, dayChangeHour)
    const dayStr = format(day, "yyyy-MM-dd")
    if (!entries.has(dayStr)) {
      entries.set(dayStr, day)
    }
  }

  return Array.from(entries.entries())
}

const getDayTitles = (days: Iterable<[string, Date]>): Map<string, string> => {
  const res = new Map<string, string>()
  for (const [dayStr, day] of days) {
    const fmt = format(day, "EEEE")
    res.set(dayStr, fmt)
  }
  return res
}

const getDefaultDayStr = (days: [string, Date][], tz: string): string => {
  const now = toTimezone(new Date(), tz)
  
  // find the day containing the current time
  for (const [s, start] of days) {
    const end = add(start, { days: 1 })
    if (!isBefore(now, start) && isBefore(now, end)) {
      return s
    }
  }

  // or the first or last day
  if (isBefore(now, days[0][1])) {
    return days[0][0]
  } else {
    return days[days.length - 1][0]
  }
}
