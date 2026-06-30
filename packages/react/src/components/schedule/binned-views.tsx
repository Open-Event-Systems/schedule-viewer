import { Stack, Title, useProps } from "@mantine/core"
import { DayFilter } from "../filters/day-filter.js"
import {
  useCallback,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react"
import {
  binByName,
  getDefaultDay,
  iterToArr,
  makeDateFilter,
  makeDayBinFunc,
  makeTagBinFunc,
  makeTimeBinFunc,
  type Day,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { ItemPills, type ItemPillsProps } from "../pill/item-pills.js"
import type { TagConfigEntry, TagIndicatorConfigEntry } from "../../types.js"
import { Bins, type BinsProps } from "../bins/bins.js"
import dayjs, { Dayjs } from "dayjs"

type RenderItemPills = (props: ItemPillsProps) => ReactNode

export type DailyAgendaViewProps = {
  className?: string
  items?: Iterable<ScheduleItem>
  tags?: Iterable<TagConfigEntry>
  tagIndicators?: Iterable<TagIndicatorConfigEntry>
  now?: Dayjs
  days?: Iterable<Day>
  selectedDay?: Day
  getDayHref?: (day: Day) => string | undefined
  onSelectDay?: (day: Day) => void
  dayFormat?: string
  renderItemPills?: RenderItemPills
  renderItemPillsTitle?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
}

export const DailyAgendaView = (props: DailyAgendaViewProps) => {
  const {
    className,
    items,
    tags,
    tagIndicators,
    now,
    days,
    selectedDay,
    getDayHref,
    onSelectDay,
    dayFormat,
    renderItemPills,
    renderItemPillsTitle,
  } = useProps("DailyAgendaView", { now: dayjs() }, props)

  const defaultDay = getDefaultDay(days ?? [], now)

  const dayFiltered = useMemo(() => {
    const day = selectedDay ?? defaultDay
    if (day) {
      const filter = makeDateFilter(day)
      return [...(items ?? [])].filter(hasStartDate).filter(filter)
    } else {
      return []
    }
  }, [items, selectedDay ?? defaultDay, days])

  const binFunc = useMemo(() => {
    return makeTimeBinFunc(now)
  }, [now])

  return (
    <Stack className={clsx("DailyAgendaView-root", className)}>
      <DayFilter
        className="DailyAgendaView-dayFilter"
        days={days}
        selectedDay={selectedDay?.key ?? defaultDay?.key}
        getHref={getDayHref}
        onSelectDay={onSelectDay}
        dayFormat={dayFormat}
      />
      <ItemBins
        className="DailyAgendaView-bins"
        items={dayFiltered}
        binFunc={binFunc}
        tags={tags}
        tagIndicators={tagIndicators}
        renderItemPills={renderItemPills}
        renderItemPillsName={renderItemPillsTitle}
      />
    </Stack>
  )
}

export type FullAgendaViewProps = {
  className?: string
  items?: Iterable<ScheduleItem>
  tags?: Iterable<TagConfigEntry>
  tagIndicators?: Iterable<TagIndicatorConfigEntry>
  now?: Dayjs
  dayChangeHour?: number
  dayFormat?: string
  renderItemPills?: RenderItemPills
  renderItemPillsName?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
  renderDayName?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
}

export const FullAgendaView = (props: FullAgendaViewProps) => {
  const {
    className,
    items,
    now,
    tags,
    tagIndicators,
    dayChangeHour,
    dayFormat,
    renderItemPills,
    renderItemPillsName,
    renderDayName,
  } = useProps("DailyAgendaView", { now: dayjs() }, props)

  const bins = useMemo(() => {
    const binFunc = makeDayBinFunc(dayChangeHour, dayFormat)
    return binFunc(iterToArr(items).filter(hasStartDate))
  }, [items, dayChangeHour, dayFormat])

  return (
    <Stack className={clsx("FullAgendaView-root", className)}>
      <Bins
        bins={bins}
        renderBin={(dayBinProps, dayBin) => (
          <FullAgendaViewDayBin
            items={dayBin.items}
            now={now}
            tags={tags}
            tagIndicators={tagIndicators}
            dayChangeHour={dayChangeHour}
            dayFormat={dayFormat}
            renderItemPills={renderItemPills}
            renderItemPillsName={renderItemPillsName}
            title={dayBin.name}
            renderDayName={renderDayName}
            {...dayBinProps}
          />
        )}
      />
    </Stack>
  )
}

const FullAgendaViewDayBin = (
  props: FullAgendaViewProps & {
    name?: ReactNode
  },
) => {
  const {
    items,
    tags,
    tagIndicators,
    now = dayjs(),
    renderItemPills,
    renderItemPillsName,
    name,
    renderDayName,
  } = props

  const binFunc = useMemo(() => makeTimeBinFunc(now), [now])

  const wrappedRenderItemPillsName = useCallback(
    (props: ComponentPropsWithoutRef<"h2">) => (
      <Title renderRoot={renderItemPillsName} order={3} {...props} />
    ),
    [renderItemPillsName],
  )

  return (
    <ItemBins
      className="FullAgendaView-day"
      items={items}
      binFunc={binFunc}
      tags={tags}
      tagIndicators={tagIndicators}
      name={name}
      renderItemPills={renderItemPills}
      renderItemPillsName={wrappedRenderItemPillsName}
      renderTitle={renderDayName}
    />
  )
}

export type DailyCatalogViewProps = {
  className?: string
  items?: Iterable<ScheduleItem>
  tags?: Iterable<TagConfigEntry>
  tagIndicators?: Iterable<TagIndicatorConfigEntry>
  now?: Dayjs
  days?: Iterable<Day>
  selectedDay?: Day
  getDayHref?: (day: Day) => string | undefined
  onSelectDay?: (day: Day) => void
  dayFormat?: string
  renderItemPills?: RenderItemPills
  renderItemPillsName?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
}

export const DailyCatalogView = (props: DailyCatalogViewProps) => {
  const {
    className,
    items,
    tags,
    tagIndicators,
    now,
    days,
    selectedDay,
    getDayHref,
    onSelectDay,
    dayFormat,
    renderItemPills,
    renderItemPillsName,
  } = useProps("DailyCatalogView", { now: dayjs() }, props)

  const defaultDay = getDefaultDay(days ?? [], now)

  const dayFiltered = useMemo(() => {
    const day = selectedDay ?? defaultDay
    if (day) {
      const filter = makeDateFilter(day)
      return iterToArr(items).filter(hasStartDate).filter(filter)
    } else {
      return []
    }
  }, [items, selectedDay ?? defaultDay, days])

  return (
    <Stack className={clsx("DailyCatalogView-root", className)}>
      <DayFilter
        className="DailyCatalogView-dayFilter"
        days={days}
        selectedDay={selectedDay?.key ?? defaultDay?.key}
        getHref={getDayHref}
        onSelectDay={onSelectDay}
        dayFormat={dayFormat}
      />
      <ItemBins
        className="DailyCatalogView-bins"
        items={dayFiltered}
        binFunc={binByName}
        tags={tags}
        tagIndicators={tagIndicators}
        renderItemPills={renderItemPills}
        renderItemPillsName={renderItemPillsName}
      />
    </Stack>
  )
}

export type CatalogViewProps = {
  className?: string
  items?: Iterable<ScheduleItem>
  tags?: Iterable<TagConfigEntry>
  tagIndicators?: Iterable<TagIndicatorConfigEntry>
  renderItemPills?: RenderItemPills
  renderItemPillsTitle?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
}

export const CatalogView = (props: CatalogViewProps) => {
  const {
    className,
    items,
    tags,
    tagIndicators,
    renderItemPills,
    renderItemPillsTitle,
  } = useProps("CatalogView", null, props)

  return (
    <Stack className={clsx("CatalogView-root", className)}>
      <ItemBins
        items={items}
        binFunc={binByName}
        tags={tags}
        tagIndicators={tagIndicators}
        renderItemPills={renderItemPills}
        renderItemPillsName={renderItemPillsTitle}
      />
    </Stack>
  )
}

export type TagsViewProps = {
  className?: string
  items?: Iterable<ScheduleItem>
  tags?: Iterable<TagConfigEntry>
  tagIndicators?: Iterable<TagIndicatorConfigEntry>
  renderItemPills?: RenderItemPills
  renderItemPillsName?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
}

export const TagsView = (props: TagsViewProps) => {
  const {
    className,
    items,
    tags,
    tagIndicators,
    renderItemPills,
    renderItemPillsName,
  } = useProps("TagsView", null, props)

  const binFunc = useMemo(() => makeTagBinFunc(tags ?? []), [tags])

  return (
    <Stack className={clsx("TagsView-root", className)}>
      <ItemBins
        items={items}
        binFunc={binFunc}
        tags={tags}
        tagIndicators={tagIndicators}
        renderItemPills={renderItemPills}
        renderItemPillsName={renderItemPillsName}
      />
    </Stack>
  )
}

const ItemBins = (
  props: Omit<BinsProps<ScheduleItem>, "renderBin"> & {
    tags?: Iterable<TagConfigEntry>
    tagIndicators?: Iterable<TagIndicatorConfigEntry>
    renderItemPills?: (props: ItemPillsProps) => ReactNode
    renderItemPillsName?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
  },
) => {
  const {
    tags,
    tagIndicators,
    renderItemPills = (props) => <ItemPills {...props} />,
    renderItemPillsName,
    ...other
  } = props

  const renderBin = useCallback(
    (
      props: ComponentPropsWithoutRef<"h2">,
      bin: Readonly<{
        key: string
        name?: ReactNode
        items?: Iterable<ScheduleItem>
      }>,
    ) =>
      renderItemPills({
        items: iterToArr(bin.items),
        tags,
        tagIndicators,
        name: bin.name,
        renderName: renderItemPillsName,
        ...props,
      }),
    [tags, tagIndicators, renderItemPills, renderItemPillsName],
  )

  return <Bins {...other} renderBin={renderBin} />
}

const hasStartDate = <T extends ScheduleItem>(
  item: T,
): item is T & { readonly startDate: Dayjs } =>
  "startDate" in item && !!item.startDate
