import {
  getDays,
  getDefaultDay,
  makeDateFilter,
  ScheduleItemStore,
  type Day,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import { Fragment, memo, useMemo, type ReactNode } from "react"
import {
  Stack,
  Text,
  Title,
  useProps,
  type StackProps,
  type TitleProps,
} from "@mantine/core"
import { format } from "date-fns"
import { DayFilter } from "../day-filter/day-filter.js"
import {
  binItemsByTag,
  binItemsByTime,
  binItemsByTitle,
  type ItemBin,
} from "../pill/item-pill-utils.js"
import { useScheduleConfig } from "../../hooks/config.js"
import { ItemPill, type ItemPillProps } from "../pill/item-pill.js"
import type { TagEntry, TagIndicatorEntry } from "../../types.js"

export type ScheduleType = "daily-agenda" | "full-agenda" | "catalog" | "tags"

export type ScheduleProps = {
  items: ScheduleItemStore
  filteredItems: ScheduleItemStore
  type?: ScheduleType
  selectedDayKey?: string
  now?: Date
  dayTitleComponent?: string
  binTitleComponent?: string
  onSelectDay?: (day: Day) => void
  renderPill?: (props: ItemPillProps) => ReactNode
}

export const Schedule = (props: ScheduleProps) => {
  const { filteredItems, type } = props

  if (filteredItems.size == 0 && type != "daily-agenda") {
    return <Schedule.NoItems />
  }

  let Component

  switch (type) {
    default:
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
    now,
    items,
    filteredItems,
    selectedDayKey,
    binTitleComponent,
    renderPill,
    onSelectDay,
  } = useProps("DailyAgendaView", { now: new Date() }, props)

  const { dayChangeHour, binMinutes, dayFormat, tags, tagIndicators } =
    useScheduleConfig()

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
        <Schedule.ItemBins
          bins={bins}
          tags={tags}
          tagIndicators={tagIndicators}
          titleComponent={binTitleComponent}
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
    renderPill,
  } = useProps("FullAgendaView", {}, props)

  const { dayChangeHour, dayFormat, binMinutes, tags, tagIndicators } =
    useScheduleConfig()

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
        <Schedule.ItemBins
          bins={bins}
          titleComponent={binTitleComponent}
          tags={tags}
          tagIndicators={tagIndicators}
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
  const { filteredItems, renderPill, binTitleComponent } = useProps(
    "CatalogView",
    {},
    props,
  )
  const { tags, tagIndicators } = useScheduleConfig()

  const bins = useMemo(() => binItemsByTitle(filteredItems), [filteredItems])

  return (
    <Schedule.ItemBins
      bins={bins}
      titleComponent={binTitleComponent}
      tags={tags}
      tagIndicators={tagIndicators}
      renderPill={renderPill}
    />
  )
}

const TagsView = (props: ScheduleProps) => {
  const { filteredItems, binTitleComponent, renderPill } = useProps(
    "TagsView",
    {},
    props,
  )

  const { tags, tagIndicators } = useScheduleConfig()

  const bins = useMemo(
    () => binItemsByTag(filteredItems, tags),
    [filteredItems, tags],
  )

  return (
    <Schedule.ItemBins
      bins={bins}
      titleComponent={binTitleComponent}
      tags={tags}
      tagIndicators={tagIndicators}
      renderPill={renderPill}
    />
  )
}

export type ScheduleItemBinsProps = {
  bins?: Iterable<ItemBin>
  tags?: Iterable<TagEntry>
  tagIndicators?: Iterable<TagIndicatorEntry>
  titleComponent?: string
  renderPill?: (props: ItemPillProps) => ReactNode
} & StackProps

const ItemBins = memo((props: ScheduleItemBinsProps) => {
  const { bins, tags, tagIndicators, titleComponent, renderPill, ...other } =
    useProps("ScheduleItemBins", { bins: [] }, props)

  return (
    <Stack {...other}>
      {Array.from(bins, (bin) => {
        return (
          <ItemPill.Bin
            key={bin.id}
            title={bin.title}
            titleComponent={titleComponent}
            items={bin.items}
            tags={tags}
            tagIndicators={tagIndicators}
            renderPill={renderPill}
          />
        )
      })}
    </Stack>
  )
})

ItemBins.displayName = "Schedule.ItemBins"

const NoItems = () => (
  <Text c="dimmed" ta="center">
    No items
  </Text>
)

Schedule.DailyAgenda = DailyAgendaView
Schedule.FullAgenda = FullAgendaView
Schedule.Catalog = CatalogView
Schedule.Tags = TagsView
Schedule.ItemBins = ItemBins
Schedule.NoItems = NoItems
