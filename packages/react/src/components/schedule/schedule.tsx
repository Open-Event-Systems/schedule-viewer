import {
  getDays,
  getDefaultDay,
  makeDateFilter,
  ScheduleItemStore,
  type Day,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import { Fragment, useMemo, type ReactNode } from "react"
import { Stack, Text, Title, useProps, type TitleProps } from "@mantine/core"
import { format } from "date-fns"
import { DayFilter } from "../day-filter/day-filter.js"
import {
  binItemsByTag,
  binItemsByTime,
  binItemsByTitle,
  type PillsItemBin,
  type PillsItemType,
} from "../pills/bin.js"
import { Pills, type PillBinProps, type PillProps } from "../pills/pills.js"
import { useScheduleConfig } from "../../hooks/config.js"

export type ScheduleProps = {
  items: ScheduleItemStore
  filteredItems: ScheduleItemStore
  type?: "daily-agenda" | "full-agenda" | "catalog" | "tags"
  selectedDayKey?: string
  now?: Date
  dayTitleComponent?: string
  binTitleComponent?: string
  BinProps?: Partial<PillBinProps>
  PillProps?: Partial<PillProps>
  renderBin?: (props: PillBinProps, bin: PillsItemBin) => ReactNode
  renderPill?: (props: PillProps, item: PillsItemType) => ReactNode
  onSelectDay?: (day: Day) => void
}

export const Schedule = (props: ScheduleProps) => {
  const { filteredItems, type = "daily-agenda" } = props

  if (filteredItems.size == 0 && type != "daily-agenda") {
    return <Schedule.NoItems />
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
    filteredItems,
    selectedDayKey,
    binTitleComponent,
    BinProps,
    PillProps,
    renderBin,
    renderPill,
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
      return filteredItems
    }

    return filteredItems.filter(makeDateFilter(selectedDay))
  }, [filteredItems, selectedDay])

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
        <Pills
          bins={bins}
          titleComponent={binTitleComponent}
          BinProps={BinProps}
          PillProps={PillProps}
          renderBin={renderBin}
          renderPill={renderPill}
        />
      ) : (
        <Schedule.NoItems />
      )}
    </Stack>
  )
}

const FullAgendaView = (props: ScheduleProps) => {
  const {
    filteredItems,
    dayTitleComponent = "h3",
    binTitleComponent = "h4",
    BinProps,
    PillProps,
    renderBin,
    renderPill,
  } = useProps("FullAgendaView", {}, props)

  const { dayChangeHour, dayFormat, binMinutes } = useScheduleConfig()

  const { dayLabels, binsByDay } = useMemo(() => {
    const days = getDays(
      filteredItems.filter(
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
          const filtered = filteredItems.filter(makeDateFilter(d))
          const bins = binItemsByTime(filtered, binMinutes)
          return [d.key, bins] as const
        })
        .filter((e) => e[1].length > 0),
    )

    return { dayLabels, binsByDay }
  }, [filteredItems, dayChangeHour, dayFormat, binMinutes])

  const elements = []

  for (const [key, bins] of binsByDay.entries()) {
    const dayLabel = dayLabels.get(key) ?? key
    elements.push(
      <Fragment key={key}>
        <FullAgendaView.DayTitle component={dayTitleComponent}>
          {dayLabel}
        </FullAgendaView.DayTitle>
        <Pills
          bins={bins}
          titleComponent={binTitleComponent}
          BinProps={BinProps}
          PillProps={PillProps}
          renderBin={renderBin}
          renderPill={renderPill}
        />
      </Fragment>,
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
  const { filteredItems, BinProps, PillProps, renderBin, renderPill } =
    useProps("CatalogView", {}, props)
  const bins = useMemo(() => binItemsByTitle(filteredItems), [filteredItems])

  return (
    <Pills
      bins={bins}
      BinProps={BinProps}
      PillProps={PillProps}
      renderBin={renderBin}
      renderPill={renderPill}
    />
  )
}

const TagsView = (props: ScheduleProps) => {
  const { filteredItems, BinProps, PillProps, renderBin, renderPill } =
    useProps("TagsView", {}, props)

  const { tags } = useScheduleConfig()

  const bins = useMemo(
    () => binItemsByTag(filteredItems, tags),
    [filteredItems, tags],
  )

  return (
    <Pills
      bins={bins}
      BinProps={BinProps}
      PillProps={PillProps}
      renderBin={renderBin}
      renderPill={renderPill}
    />
  )
}

const NoItems = () => (
  <Text c="dimmed" ta="center">
    No items
  </Text>
)

Schedule.DailyAgenda = DailyAgendaView
Schedule.FullAgenda = FullAgendaView
Schedule.Catalog = CatalogView
Schedule.Tags = TagsView
Schedule.NoItems = NoItems
