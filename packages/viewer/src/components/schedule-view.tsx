import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { getDays, getDefaultDay } from "../utils.js"
import {
  type Bounded,
  isBounded,
  makeDateFilter,
  type ScheduleItem,
  ScheduleItemStore,
  toTimezone,
} from "@open-event-systems/schedule-lib"
import {
  DayFilter,
  type DayFilterDay,
} from "@open-event-systems/schedule-react/components/day-filter/day-filter"
import {
  binItemsByTime,
  ItemPills,
} from "@open-event-systems/schedule-react/components/pills/item-pills"
import { Stack, Text } from "@mantine/core"
import { useTime, type ViewerConfig } from "../config.js"

export type ScheduleViewProps = {
  config: ViewerConfig
  events: ScheduleItemStore
  allEvents: ScheduleItemStore
  selectedDay?: string | null
  setSelectedDay?: (day: DayFilterDay) => void
}

export const ScheduleView = observer((props: ScheduleViewProps) => {
  const {
    config,
    events,
    allEvents,
    selectedDay: selectedDayKey,
    setSelectedDay,
  } = props

  const now = useTime()

  const days = useMemo(
    () =>
      getDays(
        Array.from(allEvents).filter(isBounded),
        config.timeZone,
        config.dayChangeHour,
      ),
    [allEvents, config.timeZone, config.dayChangeHour],
  )

  const defaultDay = useMemo(
    () => getDefaultDay(days, toTimezone(now, config.timeZone)),
    [days, config.timeZone],
  )

  const selectedDay = days.find((d) => d.key == selectedDayKey) || defaultDay

  const dayFiltered = useMemo(() => {
    const arr = Array.from(events).filter(isBounded)
    if (!selectedDay) {
      return new ScheduleItemStore(arr)
    }

    return new ScheduleItemStore(arr.filter(makeDateFilter(selectedDay)))
  }, [events, selectedDay])

  return (
    <Stack>
      <DayFilter
        days={days}
        selectedDay={selectedDay?.key}
        onSelectDay={setSelectedDay}
      />
      {dayFiltered.size > 0 ? (
        <PillsView items={dayFiltered} binMinutes={config.binMinutes} />
      ) : (
        <Text c="dimmed" ta="center">
          No events
        </Text>
      )}
    </Stack>
  )
})

ScheduleView.displayName = "ScheduleView"

type ViewProps = {
  items: ScheduleItemStore<Bounded<ScheduleItem>>
  binMinutes: number
}

const PillsView = (props: ViewProps) => {
  const { items, binMinutes } = props
  const bins = useMemo(
    () => binItemsByTime(items, binMinutes),
    [items, binMinutes],
  )
  return <ItemPills bins={bins} />
}
