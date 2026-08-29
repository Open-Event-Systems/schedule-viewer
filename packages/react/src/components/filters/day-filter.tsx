import { ActionIcon, Box, Select, useProps } from "@mantine/core"
import clsx from "clsx"
import { useMemo, type MouseEvent } from "react"
import { iterToArr, type Day } from "@open-event-systems/schedule-lib"

import classes from "./day-filter.module.scss"
import { CaretLeftIcon } from "@phosphor-icons/react/dist/icons/CaretLeft"
import { CaretRightIcon } from "@phosphor-icons/react/dist/icons/CaretRight"
import type { DefaultBoxProps } from "../types.js"

export type DayFilterProps = {
  days?: Iterable<Day> | undefined
  dayFormat?: string | undefined
  selectedDay?: string | undefined
  getHref?: (day: Day) => string | undefined
  onSelectDay?: ((day: Day) => void) | undefined
} & DefaultBoxProps

const defaultDayFormat = "dddd, MMM D"

export const DayFilter = (props: DayFilterProps) => {
  const {
    className,
    days,
    dayFormat,
    selectedDay,
    getHref,
    onSelectDay,
    ...other
  } = useProps("DayFilter", { dayFormat: defaultDayFormat }, props)

  const daysArr = iterToArr(days)

  const { daysByKey, dayData } = useMemo(() => {
    const daysByKey = new Map<string, Day>()
    const dayData = []

    for (const day of daysArr) {
      const label = day.startDate.format(dayFormat)
      daysByKey.set(day.key, day)
      dayData.push({ value: day.key, label })
    }

    return { daysByKey, dayData }
  }, [daysArr, dayFormat])

  const selectedIdx = dayData.findIndex((o) => o.value == selectedDay)

  const canPrev = selectedIdx > 0
  const prevDay = canPrev ? daysArr[selectedIdx - 1] : undefined
  const prevHref = prevDay && getHref ? getHref(prevDay) : undefined
  const canNext = selectedIdx < dayData.length - 1
  const nextDay = canNext ? daysArr[selectedIdx + 1] : undefined
  const nextHref = nextDay && getHref ? getHref(nextDay) : undefined

  return (
    <Box
      component="section"
      aria-label="day filter"
      className={clsx("DayFilter-root", classes.root, className)}
      {...other}
    >
      <ActionIcon
        className={clsx(
          "DayFilter-prev",
          "DayFilter-button",
          classes.prev,
          classes.button,
        )}
        component={prevHref ? "a" : "button"}
        variant="subtle"
        title="Previous Day"
        href={prevHref}
        disabled={!canPrev}
        onClick={(e: MouseEvent) => {
          e.preventDefault()
          const prevDayOpt = dayData[selectedIdx - 1]
          const prevDay = prevDayOpt
            ? daysByKey.get(prevDayOpt.value)
            : undefined
          prevDay && onSelectDay && onSelectDay(prevDay)
        }}
      >
        <CaretLeftIcon />
      </ActionIcon>
      <Select
        title="Select Day"
        className={clsx("DayFilter-select", classes.select)}
        classNames={{
          input: clsx("DayFilter-selectInput", classes.selectInput),
        }}
        variant="unstyled"
        data={dayData}
        value={selectedDay ?? null}
        onChange={(v) => {
          if (v) {
            const day = daysByKey.get(v)
            day && onSelectDay && onSelectDay(day)
          }
        }}
        rightSection={null}
      />
      <ActionIcon
        className={clsx(
          "DayFilter-next",
          "DayFilter-button",
          classes.next,
          classes.button,
        )}
        component={nextHref ? "a" : "button"}
        variant="subtle"
        title="Next Day"
        href={nextHref}
        disabled={!canNext}
        onClick={(e: MouseEvent) => {
          e.preventDefault()
          const nextDayOpt = dayData[selectedIdx + 1]
          const nextDay = nextDayOpt
            ? daysByKey.get(nextDayOpt.value)
            : undefined
          nextDay && onSelectDay && onSelectDay(nextDay)
        }}
      >
        <CaretRightIcon />
      </ActionIcon>
    </Box>
  )
}
