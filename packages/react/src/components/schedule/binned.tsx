import { Stack, Title, useProps, type BoxProps } from "@mantine/core"
import {
  NoItemsMessage,
  type BaseScheduleComponentProps,
} from "./schedule-component.js"
import { DayFilter } from "../filters/day-filter.js"
import {
  useCallback,
  useMemo,
  type AllHTMLAttributes,
  type ReactNode,
} from "react"
import {
  binByTitle,
  getDefaultDay,
  makeDateFilter,
  makeDayBinFunc,
  makeTagBinFunc,
  makeTimeBinFunc,
} from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { ScheduleBins } from "./bins.js"
import { ItemPills, type ItemPillsProps } from "../pill/item-pills.js"

export type DailyAgendaViewProps = BaseScheduleComponentProps

export const DailyAgendaView = (props: DailyAgendaViewProps) => {
  const {
    className,
    items,
    now = new Date(),
    days,
    selectedDay,
    getDayHref,
    onSelectDay,
    dayFormat,
    renderItemPills,
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
      {dayFiltered && dayFiltered.length > 0 ? (
        <ScheduleBins
          className="DailyAgendaView-bins"
          items={dayFiltered}
          binFunc={binFunc}
          renderItemPills={renderItemPills}
        />
      ) : (
        <NoItemsMessage />
      )}
    </Stack>
  )
}

export type FullAgendaViewProps = BaseScheduleComponentProps

export const FullAgendaView = (props: FullAgendaViewProps) => {
  const {
    className,
    items,
    now = new Date(),
    dayChangeHour,
    dayFormat,
    renderItemPills,
  } = useProps("DailyAgendaView", null, props)

  const dayBins = useMemo(() => {
    return [...makeDayBinFunc(dayChangeHour, dayFormat)(items ?? [])]
  }, [now, dayChangeHour, dayFormat, items])

  return (
    <Stack className={clsx("FullAgendaView-root", className)}>
      {dayBins.length > 0 ? (
        dayBins.map((b) => (
          <FullAgendaViewDayBin
            key={b.key}
            {...props}
            items={b.items}
            title={b.title}
            renderItemPills={renderItemPills}
          />
        ))
      ) : (
        <NoItemsMessage />
      )}
    </Stack>
  )
}

const FullAgendaViewDayBin = (
  props: FullAgendaViewProps & { title?: ReactNode },
) => {
  const {
    items,
    now = new Date(),
    renderItemPills = (props) => <ItemPills {...props} />,
    title,
  } = props

  const binFunc = useMemo(() => {
    return makeTimeBinFunc(now)
  }, [now])

  const renderTitle = useCallback(
    (props: AllHTMLAttributes<HTMLElement> & BoxProps) => <h3 {...props} />,
    [],
  )

  const wrappedRenderItemPills = useCallback(
    (props: ItemPillsProps) =>
      renderItemPills({
        ...props,
        renderTitle: (tProps) => <h3 {...tProps} />,
      }),
    [renderItemPills],
  )

  return (
    <Stack className="FullAgendaView-day">
      <Title className="FullAgendaView-dayTitle" order={2}>
        {title}
      </Title>
      <ScheduleBins
        className="FullAgendaView-bins"
        items={items}
        binFunc={binFunc}
        renderItemPills={wrappedRenderItemPills}
        renderTitle={renderTitle}
      />
    </Stack>
  )
}

export type CatalogViewProps = BaseScheduleComponentProps

export const CatalogView = (props: CatalogViewProps) => {
  const { className, items, renderItemPills } = useProps(
    "CatalogView",
    null,
    props,
  )

  const itemsArr = [...(items ?? [])]

  return (
    <Stack className={clsx("CatalogView-root", className)}>
      {itemsArr && itemsArr.length > 0 ? (
        <ScheduleBins
          className="CatalogView-bins"
          items={items}
          binFunc={binByTitle}
          renderItemPills={renderItemPills}
        />
      ) : (
        <NoItemsMessage />
      )}
    </Stack>
  )
}

export type TagsViewProps = BaseScheduleComponentProps

export const TagsView = (props: TagsViewProps) => {
  const { className, items, tags, renderItemPills } = useProps(
    "TagsView",
    null,
    props,
  )

  const itemsArr = [...(items ?? [])]

  const binFunc = useMemo(() => {
    return makeTagBinFunc(tags ?? [])
  }, [tags])

  return (
    <Stack className={clsx("TagsView-root", className)}>
      {itemsArr && itemsArr.length > 0 ? (
        <ScheduleBins
          className="TagsView-bins"
          items={items}
          binFunc={binFunc}
          renderItemPills={renderItemPills}
        />
      ) : (
        <NoItemsMessage />
      )}
    </Stack>
  )
}
