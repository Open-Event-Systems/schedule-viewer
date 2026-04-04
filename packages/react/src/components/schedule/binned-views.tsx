import { Stack, Title, useProps } from "@mantine/core"
import { DayFilter } from "../filters/day-filter.js"
import {
  useCallback,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react"
import {
  binByTitle,
  getDefaultDay,
  makeDateFilter,
  makeDayBinFunc,
  makeTagBinFunc,
  makeTimeBinFunc,
  type Day,
  type DetailedScheduleItem,
} from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { ItemPills, type ItemPillsProps } from "../pill/item-pills.js"
import type { TagEntry, TagIndicatorEntry } from "../../types.js"
import { Bins, type BinsProps } from "../bins/bins.js"
import { iterToArr } from "../../utils.js"

type RenderItemPills = (props: ItemPillsProps) => ReactNode

export type DailyAgendaViewProps = {
  className?: string
  items?: Iterable<DetailedScheduleItem>
  tags?: Iterable<TagEntry>
  tagIndicators?: Iterable<TagIndicatorEntry>
  now?: Date
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
    now = new Date(),
    days,
    selectedDay,
    getDayHref,
    onSelectDay,
    dayFormat,
    renderItemPills,
    renderItemPillsTitle,
  } = useProps("DailyAgendaView", null, props)

  const defaultDay = getDefaultDay(days ?? [], now)

  const dayFiltered = useMemo(() => {
    const day = selectedDay ?? defaultDay
    if (day) {
      const filter = makeDateFilter(day)
      return [...(items ?? [])].filter(filter)
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
        renderItemPillsTitle={renderItemPillsTitle}
      />
    </Stack>
  )
}

export type FullAgendaViewProps = {
  className?: string
  items?: Iterable<DetailedScheduleItem>
  tags?: Iterable<TagEntry>
  tagIndicators?: Iterable<TagIndicatorEntry>
  now?: Date
  dayChangeHour?: number
  dayFormat?: string
  renderItemPills?: RenderItemPills
  renderItemPillsTitle?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
  renderDayTitle?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
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
    renderItemPillsTitle,
    renderDayTitle,
  } = useProps("DailyAgendaView", null, props)

  const bins = useMemo(() => {
    const binFunc = makeDayBinFunc(dayChangeHour, dayFormat)
    return binFunc(iterToArr(items))
  }, [items, dayChangeHour, dayFormat])

  return (
    <Stack className={clsx("FullAgendaView-root", className)}>
      <Bins<DetailedScheduleItem>
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
            renderItemPillsTitle={renderItemPillsTitle}
            title={dayBin.title}
            renderDayTitle={renderDayTitle}
            {...dayBinProps}
          />
        )}
      />
    </Stack>
  )
}

const FullAgendaViewDayBin = (
  props: FullAgendaViewProps & {
    title?: ReactNode
  },
) => {
  const {
    items,
    tags,
    tagIndicators,
    now = new Date(),
    renderItemPills,
    renderItemPillsTitle,
    title,
    renderDayTitle,
  } = props

  const binFunc = useMemo(() => makeTimeBinFunc(now), [now])

  const wrappedRenderItemPillsTitle = useCallback(
    (props: ComponentPropsWithoutRef<"h2">) => (
      <Title renderRoot={renderItemPillsTitle} order={3} {...props} />
    ),
    [renderItemPillsTitle],
  )

  return (
    <ItemBins
      className="FullAgendaView-day"
      items={items}
      binFunc={binFunc}
      tags={tags}
      tagIndicators={tagIndicators}
      title={title}
      renderItemPills={renderItemPills}
      renderItemPillsTitle={wrappedRenderItemPillsTitle}
      renderTitle={renderDayTitle}
    />
  )
}

export type CatalogViewProps = {
  className?: string
  items?: Iterable<DetailedScheduleItem>
  tags?: Iterable<TagEntry>
  tagIndicators?: Iterable<TagIndicatorEntry>
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
        binFunc={binByTitle}
        tags={tags}
        tagIndicators={tagIndicators}
        renderItemPills={renderItemPills}
        renderItemPillsTitle={renderItemPillsTitle}
      />
    </Stack>
  )
}

export type TagsViewProps = {
  className?: string
  items?: Iterable<DetailedScheduleItem>
  tags?: Iterable<TagEntry>
  tagIndicators?: Iterable<TagIndicatorEntry>
  renderItemPills?: RenderItemPills
  renderItemPillsTitle?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
}

export const TagsView = (props: TagsViewProps) => {
  const {
    className,
    items,
    tags,
    tagIndicators,
    renderItemPills,
    renderItemPillsTitle,
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
        renderItemPillsTitle={renderItemPillsTitle}
      />
    </Stack>
  )
}

const ItemBins = (
  props: Omit<BinsProps<DetailedScheduleItem>, "renderBin"> & {
    tags?: Iterable<TagEntry>
    tagIndicators?: Iterable<TagIndicatorEntry>
    renderItemPills?: (props: ItemPillsProps) => ReactNode
    renderItemPillsTitle?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
  },
) => {
  const {
    tags,
    tagIndicators,
    renderItemPills = (props) => <ItemPills {...props} />,
    renderItemPillsTitle,
    ...other
  } = props

  const renderBin = useCallback(
    (
      props: ComponentPropsWithoutRef<"h2">,
      bin: Readonly<{
        key: string
        title?: ReactNode
        items?: Iterable<DetailedScheduleItem>
      }>,
    ) =>
      renderItemPills({
        items: iterToArr(bin.items),
        tags,
        tagIndicators,
        title: bin.title,
        renderTitle: renderItemPillsTitle,
        ...props,
      }),
    [tags, tagIndicators, renderItemPills, renderItemPillsTitle],
  )

  return <Bins {...other} renderBin={renderBin} />
}
