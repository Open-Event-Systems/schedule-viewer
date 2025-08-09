import { Event, isScheduled } from "@open-event-systems/schedule-lib"
import { Pills, PillsProps } from "./pills.js"
import { useProps } from "@mantine/core"
import { format, formatISO } from "date-fns"
import { TZDate } from "@date-fns/tz"
import { makeTagIndicatorFunc, useScheduleConfig } from "../config/context.js"
import { MouseEvent, ReactNode, useCallback, useMemo } from "react"
import { EventHoverCard } from "../hovercard/event-hover-card.js"
import clsx from "clsx"
import { useEventDetails } from "../details/context.js"

export type EventPillsProps = PillsProps & {
  events: Iterable<Event>
  binMinutes?: number
}

export const EventPills = (props: EventPillsProps) => {
  const {
    className,
    events,
    binMinutes = 30,
    ...other
  } = useProps("EventPills", {}, props)

  const config = useScheduleConfig()
  const getIndicator = useMemo(() => {
    const tagFunc = makeTagIndicatorFunc(config.tagIndicators)
    return (ev: Event) => tagFunc(ev.tags ?? [])
  }, [config.tagIndicators])

  const bins = useMemo(
    () => makeBins(events, binMinutes, config.timeZone),
    [events],
  )

  const binEls = useMemo(() => {
    const res: ReactNode[] = []
    bins.forEach(([date, evs], b) => {
      res.push(
        <EventPillsBin
          key={b}
          date={date}
          events={evs}
          getIndicator={getIndicator}
        />,
      )
    })
    return res
  }, [bins, getIndicator])

  return <Pills {...other}>{binEls}</Pills>
}

const EventPillsBin = ({
  date,
  events,
  getIndicator,
}: {
  date: Date
  events: readonly Event[]
  getIndicator?: (event: Event) => string | undefined
}) => {
  const label = format(date, "h:mm aaa")

  const items = events.map((e) => (
    <EventPillsPill key={e.id} event={e} getIndicator={getIndicator} />
  ))

  return <Pills.Bin title={label}>{items}</Pills.Bin>
}

const EventPillsPill = ({
  event,
  getIndicator,
}: {
  event: Event
  getIndicator?: (event: Event) => string | undefined
}) => {
  const ctx = useEventDetails()
  const indicator = useMemo(() => {
    return getIndicator ? getIndicator(event) : undefined
  }, [event, getIndicator])

  const renderFunc = useCallback(
    (c: ReactNode) => {
      return <EventHoverCard event={event}>{c}</EventHoverCard>
    },
    [event],
  )

  const onClick = useCallback(
    (e: MouseEvent) => {
      ctx.onClickEvent && ctx.onClickEvent(e, event)
    },
    [ctx.onClickEvent, event],
  )

  return (
    <Pills.Pill
      children={event.title}
      href={ctx.getHref ? ctx.getHref(event) : undefined}
      onClick={onClick}
      renderContent={renderFunc}
      className={clsx(
        `Pill-event-id-${event.id}`,
        event.tags?.map((t) => `Pill-event-tag-${t}`),
      )}
      indicator={indicator}
    />
  )
}

const makeBins = (
  events: Iterable<Event>,
  binMinutes: number,
  tz: string,
): Map<string, [Date, Event[]]> => {
  const map = new Map<string, [Date, Event[]]>()
  for (const event of events) {
    if (isScheduled(event)) {
      const date = binDate(event.start, binMinutes, tz)
      const binStr = formatISO(date)
      let bin = map.get(binStr)

      if (!bin) {
        bin = [date, []]
        map.set(binStr, bin)
      }

      bin[1].push(event)
    }
  }

  return map
}

const binDate = (d: Date, binMinutes: number, tz: string): Date => {
  const roundedMinutes = Math.floor(d.getMinutes() / binMinutes) * binMinutes
  const rounded = new TZDate(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    roundedMinutes,
    tz,
  )

  return rounded
}
