import {
  Box,
  BoxProps,
  createPolymorphicComponent,
  Title,
  useProps,
} from "@mantine/core"
import { forwardRef, ReactNode, useContext, useMemo } from "react"
import { CalendarContext } from "./context.js"
import clsx from "clsx"
import { toPercent } from "./utils.js"
import { add, format, isBefore } from "date-fns"
import { ItemHoverCard } from "../hovercard/item-hover-card.js"
import { Bounded, ScheduleItem } from "@open-event-systems/schedule-lib"

export type CalendarColumnData = {
  title?: ReactNode
  items?: readonly Bounded<ScheduleItem & { readonly title?: string }>[]
}

export type CalendarProps = {
  columns?: CalendarColumnData[]
  direction?: "column" | "row"
  start: Date
  end: Date
} & BoxProps

export const Calendar = (props: CalendarProps) => {
  const {
    className,
    columns = [],
    direction = "column",
    start,
    end,
    ...other
  } = useProps("Calendar", {}, props)

  const columnTitles = columns.map((c, i) => (
    <Title key={i} order={5} className="Calendar-columnTitle">
      {c.title}
    </Title>
  ))

  const columnBoxes = columns.map((c, i) => (
    <CalendarColumn key={i} column={c} start={start} end={end} />
  ))

  const dirClass =
    direction == "column" ? "Calendar-dirColumn" : "Calendar-dirRow"

  const dividers = useMemo(
    () =>
      makeDividers(start, end, (s, e) => (
        <Calendar.Item
          key={s.toISOString()}
          start={s}
          end={e}
          className={clsx("Calendar-divider", {
            "Calendar-dividerMinor": s.getMinutes() != 0,
          })}
        >
          {s.getMinutes() == 0 ? format(s, "h aaa") : null}
        </Calendar.Item>
      )),
    [start, end],
  )

  return (
    <CalendarContext.Provider
      value={{
        direction,
        start,
        end,
      }}
    >
      <Box className={clsx("Calendar-root", dirClass, className)} {...other}>
        <Box className={clsx("Calendar-columns", "Calendar-columnTitles")}>
          <Box className="Calendar-corner" />
          {columnTitles}
        </Box>
        <Box className="Calendar-columns">
          <Box className={clsx("Calendar-labels", "Calendar-column")}>
            {dividers}
          </Box>
          {columnBoxes}
        </Box>
      </Box>
    </CalendarContext.Provider>
  )
}

const CalendarColumn = ({
  column,
  start,
  end,
}: Pick<CalendarProps, "start" | "end"> & {
  column: CalendarColumnData
}) => {
  const items = useMemo(
    () =>
      column.items?.map((e) => {
        return (
          <ItemHoverCard key={e.id} item={e}>
            <Calendar.Item
              component="a"
              className="Calendar-event"
              start={e.start}
              end={e.end}
            >
              {e.title}
            </Calendar.Item>
          </ItemHoverCard>
        )
      }),
    [column.items],
  )

  const dividers = useMemo(
    () =>
      makeDividers(start, end, (s) => (
        <Calendar.Item
          key={s.toISOString()}
          start={s}
          end={s}
          className={clsx("Calendar-divider", {
            "Calendar-dividerMinor": s.getMinutes() != 0,
          })}
        />
      )),
    [start, end],
  )

  return (
    <Box className="Calendar-column">
      {dividers}
      {items}
    </Box>
  )
}

export type CalendarItemProps = {
  start: Date
  end: Date
  children?: ReactNode
} & BoxProps

const CalendarItem = createPolymorphicComponent<"div", CalendarItemProps>(
  // eslint-disable-next-line react/display-name
  forwardRef<HTMLDivElement, CalendarItemProps>((props, ref) => {
    const { className, start, end, ...other } = useProps(
      "CalendarItem",
      {},
      props,
    )

    const ctx = useContext(CalendarContext)
    const boxProps: BoxProps = {}

    const startPct = toPercent(ctx.start, ctx.end, start)
    const endPct = 1 - toPercent(ctx.start, ctx.end, end)

    if (ctx.direction == "column") {
      boxProps.top = `${100 * startPct}%`
      boxProps.bottom = `${100 * endPct}%`
    } else {
      boxProps.left = `${100 * startPct}%`
      boxProps.right = `${100 * endPct}%`
    }
    return (
      <Box
        className={clsx("Calendar-item", className)}
        component="div"
        ref={ref}
        {...boxProps}
        {...other}
      />
    )
  }),
)

CalendarItem.displayName = "Calendar.Item"

Calendar.Item = CalendarItem

const makeDividers = (
  start: Date,
  end: Date,
  f: (start: Date, end: Date) => ReactNode,
): ReactNode[] => {
  let cur = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    start.getMinutes() >= 30 ? 30 : 0,
    0,
    0,
  )
  const results: ReactNode[] = []

  while (isBefore(cur, end)) {
    const tEnd = add(cur, { minutes: 30 })
    if (!isBefore(cur, start)) {
      results.push(f(cur, tEnd))
    }
    cur = tEnd
  }

  return results
}
