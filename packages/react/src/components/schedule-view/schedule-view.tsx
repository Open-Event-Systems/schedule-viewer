import { Bins } from "#src/components/bins/bins.js"
import {
  DayFilter,
  type DayFilterProps,
} from "#src/components/filters/day-filter.js"
import { BinnedView } from "#src/components/schedule-view/binned-view.js"
import type { DefaultBoxProps, RenderRootFunc } from "#src/components/types.js"
import { useSelectedDay } from "#src/hooks/filter.js"
import type { RenderItemPillFunc } from "#src/hooks/items.js"
import { Box, useProps } from "@mantine/core"
import {
  iterToArr,
  makeDateFilter,
  makeDayBinFunc,
  type Bin,
  type Day,
  type SeriesOrOccurrence,
} from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import type { Dayjs } from "dayjs"
import { useMemo, type AllHTMLAttributes, type ReactNode } from "react"

import classes from "./schedule-view.module.scss"

/**
 * Schedule view component config.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ScheduleViewConfig {}

export type ScheduleViewProps = {
  /**
   * The view type.
   */
  type: ScheduleViewType

  /**
   * The current time.
   */
  now: Dayjs

  /**
   * Props to pass to the root component.
   */
  rootProps?: DefaultBoxProps

  /**
   * The items in the schedule.
   */
  items?: Iterable<SeriesOrOccurrence>

  /**
   * Config settings passed to the view component.
   */
  config?: ScheduleViewConfig

  /**
   * Whether to group items by day.
   *
   * `true` to bin by day, `"filter"` to show a filter component.
   */
  byDay?: boolean | "filter"

  /**
   * The schedule days.
   */
  days?: Iterable<Day>

  /**
   * The day format.
   */
  dayFormat?: string

  /**
   * The selected day key.
   */
  selectedDay?: string

  /**
   * Called to change the selected day.
   */
  onSelectDay?: (day: Day) => void

  /**
   * Function to render an item pill.
   */
  renderItemPill?: RenderItemPillFunc

  /**
   * Function to render the day filter.
   */
  renderDayFilter?: (props: DayFilterProps) => ReactNode

  /**
   * Function to render the first level bin title.
   */
  renderFirstLevelBinTitle?: RenderRootFunc

  /**
   * Function to render the second level bin title.
   */
  renderSecondLevelBinTitle?: RenderRootFunc
}

export const ScheduleViewType = {
  agenda: BinnedView,
  catalog: BinnedView,
  tags: BinnedView,
} as const

export type ScheduleViewType = keyof typeof ScheduleViewType

/**
 * Schedule view component.
 */
const _ScheduleView = (props: ScheduleViewProps) => {
  const {
    items,
    config,
    type,
    days,
    byDay,
    selectedDay,
    onSelectDay,
    now,
    renderItemPill,
    renderDayFilter,
    ...other
  } = props

  let dayFilter

  const selectedDayObj = useSelectedDay(days, selectedDay, now)

  if (byDay == "filter") {
    const finalRenderDayFilter =
      renderDayFilter ?? ScheduleView.defaultRenderDayFilter
    dayFilter = finalRenderDayFilter({
      days,
      selectedDay: selectedDayObj?.key,
      onSelectDay,
    })
  }

  const dayFiltered = useMemo(() => {
    if (byDay == "filter") {
      if (selectedDayObj) {
        const dayFilter = makeDateFilter(selectedDayObj)
        return iterToArr(items).filter(dayFilter)
      }
    }

    return items
  }, [items, byDay, selectedDayObj])

  const daysArr = iterToArr(days)

  if (byDay === true) {
    return (
      <ScheduleView.Root>
        <ScheduleView.ByDay
          {...other}
          now={now}
          type={type}
          items={dayFiltered}
          config={config}
          days={days}
          selectedDay={selectedDay}
          renderItemPill={renderItemPill}
        />
      </ScheduleView.Root>
    )
  }

  const View = ScheduleViewType[type]
  if (!View) {
    return null
  }

  return (
    <ScheduleView.Root dayFilter={daysArr.length > 0 ? dayFilter : null}>
      <View
        {...other}
        now={now}
        type={type}
        items={dayFiltered}
        config={config}
        days={days}
        selectedDay={selectedDay}
        renderItemPill={renderItemPill}
      />
    </ScheduleView.Root>
  )
}

export type ScheduleViewRootProps = DefaultBoxProps & {
  dayFilter?: ReactNode
}

export const ScheduleViewRoot = (props: ScheduleViewRootProps) => {
  const { className, dayFilter, children, ...other } = useProps(
    "ScheduleViewRoot",
    null,
    props,
  )

  return (
    <Box
      className={clsx("ScheduleView-root", classes.root, className)}
      {...other}
    >
      {dayFilter}
      {children}
    </Box>
  )
}

export type ScheduleViewByDayProps = ScheduleViewProps & {}

export const ScheduleViewByDay = (props: ScheduleViewByDayProps) => {
  const {
    type,
    days,
    renderFirstLevelBinTitle,
    renderSecondLevelBinTitle,
    items,
    ...other
  } = props

  const binFunc = useMemo(() => makeDayBinFunc(days), [days])

  const View = ScheduleViewType[type]
  if (!View) {
    return null
  }

  const renderDayBin = (
    _props: AllHTMLAttributes<HTMLElement>,
    bin: Bin<SeriesOrOccurrence>,
  ) => {
    return (
      <View
        type={type}
        items={bin.items}
        renderFirstLevelBinTitle={renderSecondLevelBinTitle}
        renderSecondLevelBinTitle={renderSecondLevelBinTitle}
        {...other}
      />
    )
  }

  return (
    <Bins
      className={clsx("ScheduleView-byDay")}
      renderBin={renderDayBin}
      binFunc={binFunc}
      items={items}
      renderBinTitle={renderFirstLevelBinTitle}
    />
  )
}

const defaultRenderDayFilter = (props: DayFilterProps) => (
  <DayFilter {...props} />
)

export const ScheduleView = Object.assign(_ScheduleView, {
  Root: ScheduleViewRoot,
  ByDay: ScheduleViewByDay,
  defaultRenderDayFilter,
})
