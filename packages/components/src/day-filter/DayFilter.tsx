import { ActionIcon, Box, BoxProps, Title, useProps } from "@mantine/core"
import clsx from "clsx"
import { format } from "date-fns"
import { useMemo } from "react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

export type DayFilterDay = Readonly<{
  key: string
  start: Date
  end: Date
}>

export type DayFilterProps = {
  days?: readonly DayFilterDay[]
  selectedDay?: string
  onSelectDay?: (day: DayFilterDay) => void
} & BoxProps

export const DayFilter = (props: DayFilterProps) => {
  const {
    className,
    days = [],
    selectedDay,
    onSelectDay,
    ...other
  } = useProps("DayFilter", {}, props)

  const dayLabels = useMemo(() => {
    const labels = new Map<string, string>()
    for (const day of days) {
      const label = format(day.start, "EEEE")
      labels.set(day.key, label)
    }
    return labels
  }, [days])

  const selectedDayLabel = dayLabels.get(selectedDay ?? "")
  const selectedIdx = days.findIndex((d) => d.key == selectedDay)

  return (
    <Box className={clsx("DayFilter-root", className)} {...other}>
      <ActionIcon
        className="DayFilter-prev DayFilter-button"
        variant="subtle"
        title="Previous Day"
        color="var(--mantine-color-text)"
        disabled={selectedIdx <= 0}
        onClick={() => {
          selectedIdx > 0 && onSelectDay && onSelectDay(days[selectedIdx - 1])
        }}
      >
        <IconChevronLeft />
      </ActionIcon>
      <Title order={5} className="DayFilter-title">
        {selectedDayLabel}
      </Title>
      <ActionIcon
        className="DayFilter-next DayFilter-button"
        variant="subtle"
        title="Next Day"
        color="var(--mantine-color-text)"
        disabled={selectedIdx >= days.length - 1}
        onClick={() => {
          selectedIdx < days.length - 1 &&
            onSelectDay &&
            onSelectDay(days[selectedIdx + 1])
        }}
      >
        <IconChevronRight />
      </ActionIcon>
    </Box>
  )
}
