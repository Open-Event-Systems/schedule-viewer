import {
  isBounded,
  makeDateFilter,
  ScheduleItemStore,
  toTimezone,
} from "@open-event-systems/schedule-lib"
import { useTime } from "../../config.js"
import { useMemo } from "react"
import { getDays, getDefaultDay } from "../../utils.js"
import {
  useFilteredItems,
  useScheduleConfig,
  useSelections,
} from "@open-event-systems/schedule-react"
import type { ValidateLinkOptions } from "@tanstack/react-router"
import { Stack, Text } from "@mantine/core"
import { DayFilter } from "@open-event-systems/schedule-react/components/day-filter/day-filter"
import {
  binItemsByTime,
  ItemPills,
} from "@open-event-systems/schedule-react/components/pills/item-pills"
import { useSelectedDayKey } from "../../hooks.js"

export type DailyAgendaViewProps = {
  items: ScheduleItemStore
  curRoute: ValidateLinkOptions
}

export const DailyAgendaView = (props: DailyAgendaViewProps) => {
  const { items, curRoute } = props
  const now = useTime()
  const config = useScheduleConfig()
  const selections = useSelections()
  const filtered = useFilteredItems(items, now, selections)

  const days = useMemo(
    () =>
      getDays(
        Array.from(items).filter(isBounded),
        config.timeZone,
        config.dayChangeHour,
      ),
    [items, config.timeZone, config.dayChangeHour],
  )

  const defaultDay = useMemo(
    () => getDefaultDay(days, toTimezone(now, config.timeZone)),
    [days, config.timeZone],
  )

  const [selectedDayKey, setSelectedDay] = useSelectedDayKey(curRoute)

  const selectedDay = days.find((d) => d.key == selectedDayKey) || defaultDay

  const dayFiltered = useMemo(() => {
    if (!selectedDay) {
      return filtered
    }

    return filtered.filter(makeDateFilter(selectedDay))
  }, [filtered, selectedDay])

  const bins = useMemo(
    () => binItemsByTime(dayFiltered, config.binMinutes),
    [dayFiltered, config.binMinutes],
  )

  return (
    <Stack>
      <DayFilter
        days={days}
        selectedDay={selectedDay?.key}
        onSelectDay={setSelectedDay}
      />
      {dayFiltered.size > 0 ? (
        <ItemPills bins={bins} />
      ) : (
        <Text c="dimmed" ta="center">
          No events
        </Text>
      )}
    </Stack>
  )
}
