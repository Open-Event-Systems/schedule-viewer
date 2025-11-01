import {
  getDays,
  getDefaultDay,
  makeDateFilter,
  ScheduleItemStore,
  type Day,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import { useMemo } from "react"
import { Stack, Text, Title, useProps, type TitleProps } from "@mantine/core"
import { format } from "date-fns"
import { DayFilter } from "../day-filter/day-filter.js"
import { binItemsByTag, binItemsByTime, binItemsByTitle } from "../pills/bin.js"
import { Pills } from "../pills/pills.js"
import { useScheduleConfig } from "../../hooks/config.js"

export type ScheduleProps = {
  items: ScheduleItemStore
  type?: "daily-agenda" | "full-agenda" | "catalog" | "tags"
  selectedDayKey?: string
  now?: Date
  dayTitleComponent?: string
  binTitleComponent?: string
  onSelectDay?: (day: Day) => void
}

export const Schedule = (props: ScheduleProps) => {
  const { items, type = "daily-agenda" } = props

  if (items.size == 0 && type != "daily-agenda") {
    return <Schedule.NoEvents />
  }

  let Component

  switch (type) {
    case "daily-agenda":
      Component = Schedule.DailyAgenda
      break
    case "full-agenda":
      Component = Schedule.FullAgenda
      break
    case "catalog":
      Component = Schedule.Catalog
      break
    case "tags":
      Component = Schedule.Tags
      break
  }

  return <Component {...props} />
}

const DailyAgendaView = (props: ScheduleProps) => {
  const {
    now = new Date(),
    items,
    selectedDayKey,
    binTitleComponent,
    onSelectDay,
  } = useProps("DailyAgendaView", {}, props)

  const { dayChangeHour, binMinutes, dayFormat } = useScheduleConfig()

  const { days, defaultDay } = useMemo(() => {
    const days = getDays(
      items.filter(
        (t): t is ScheduleItem & { readonly start: Date } => !!t.start,
      ),
      dayChangeHour,
    )

    const defaultDay = getDefaultDay(days, now)

    return { days, defaultDay }
  }, [now, items, dayChangeHour])

  const selectedDay = days.find((d) => d.key == selectedDayKey) || defaultDay

  const dayFiltered = useMemo(() => {
    if (!selectedDay) {
      return items
    }

    return items.filter(makeDateFilter(selectedDay))
  }, [items, selectedDay])

  const bins = useMemo(
    () => binItemsByTime(dayFiltered, binMinutes),
    [dayFiltered, binMinutes],
  )

  return (
    <Stack>
      <DayFilter
        days={days}
        selectedDay={selectedDay?.key}
        onSelectDay={onSelectDay}
        dayFormat={dayFormat}
      />
      {dayFiltered.size > 0 ? (
        <Pills bins={bins} titleComponent={binTitleComponent} />
      ) : (
        <Schedule.NoEvents />
      )}
    </Stack>
  )
}

const FullAgendaView = (props: ScheduleProps) => {
  const {
    items,
    dayTitleComponent = "h3",
    binTitleComponent = "h4",
  } = useProps("FullAgendaView", {}, props)

  const { dayChangeHour, dayFormat, binMinutes } = useScheduleConfig()

  const { dayLabels, binsByDay } = useMemo(() => {
    const days = getDays(
      items.filter(
        (d): d is ScheduleItem & { readonly start: Date } => !!d.start,
      ),
      dayChangeHour,
    )

    const dayLabels = new Map(
      days.map((d) => [d.key, format(d.start, dayFormat)]),
    )

    const binsByDay = new Map(
      days
        .map((d) => {
          const filtered = items.filter(makeDateFilter(d))
          const bins = binItemsByTime(filtered, binMinutes)
          return [d.key, bins] as const
        })
        .filter((e) => e[1].length > 0),
    )

    return { dayLabels, binsByDay }
  }, [items, dayChangeHour, dayFormat, binMinutes])

  const elements = []

  for (const [key, bins] of binsByDay.entries()) {
    const dayLabel = dayLabels.get(key) ?? key
    elements.push(
      <>
        <FullAgendaView.DayTitle
          key={`title-${key}`}
          component={dayTitleComponent}
        >
          {dayLabel}
        </FullAgendaView.DayTitle>
        <Pills
          key={`bin-${key}`}
          bins={bins}
          titleComponent={binTitleComponent}
        />
      </>,
    )
  }

  return <Stack>{elements}</Stack>
}

const FullAgendaViewDayTitle = ({
  component,
  ...props
}: TitleProps & { component?: string }) => {
  return (
    <Title
      className="FullAgendaView-dayTitle"
      component={component}
      order={4}
      {...props}
    />
  )
}

FullAgendaView.DayTitle = FullAgendaViewDayTitle

const CatalogView = (props: ScheduleProps) => {
  const { items } = useProps("CatalogView", {}, props)
  const bins = useMemo(() => binItemsByTitle(items), [items])

  return <Pills bins={bins} />
}

const TagsView = (props: ScheduleProps) => {
  const { items } = useProps("TagsView", {}, props)

  const { tags } = useScheduleConfig()

  const bins = useMemo(() => binItemsByTag(items, tags), [items, tags])

  return <Pills bins={bins} />
}

const NoEvents = () => (
  <Text c="dimmed" ta="center">
    No events
  </Text>
)

Schedule.DailyAgenda = DailyAgendaView
Schedule.FullAgenda = FullAgendaView
Schedule.Catalog = CatalogView
Schedule.Tags = TagsView
Schedule.NoEvents = NoEvents
