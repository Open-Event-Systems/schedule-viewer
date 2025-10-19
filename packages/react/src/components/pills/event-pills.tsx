import { Pills, PillsProps } from "./pills.js"
import { useProps } from "@mantine/core"
import { format, formatISO } from "date-fns"
import { TZDate } from "@date-fns/tz"
import { ReactNode, useCallback, useMemo } from "react"
import clsx from "clsx"
import { makeTagIndicatorFunc, TagIndicatorEntry } from "../../config/config.js"
import { useEventDetails } from "../details/context.js"
import { ItemHoverCard } from "../hovercard/item-hover-card.js"
import { ScheduleItem } from "@open-event-systems/schedule-lib"

export type EventPillsBin = Readonly<{
  id: string
  title: ReactNode
  items: Iterable<ScheduleItem>
}>

export type EventPillsProps = PillsProps & {
  bins: readonly EventPillsBin[]
  tagIndicators?: readonly TagIndicatorEntry[]
}

export const EventPills = (props: EventPillsProps) => {
  const {
    className,
    bins,
    tagIndicators = [],
    ...other
  } = useProps("EventPills", {}, props)

  const getIndicator = useMemo(() => {
    const tagFunc = makeTagIndicatorFunc(tagIndicators)
    return (ev: ScheduleItem) => tagFunc(ev.tags ?? [])
  }, [tagIndicators])

  const binEls = useMemo(() => {
    const res: ReactNode[] = []
    bins.forEach((b) => {
      res.push(
        <EventPillsBin
          key={b.id}
          title={b.title}
          events={b.items}
          getIndicator={getIndicator}
        />,
      )
    })
    return res
  }, [bins, getIndicator])

  return <Pills {...other}>{binEls}</Pills>
}

const EventPillsBin = ({
  title,
  events,
  getIndicator,
}: {
  title: ReactNode
  events: Iterable<ScheduleItem>
  getIndicator?: (event: ScheduleItem) => string | undefined
}) => {
  const items = Array.from(events, (e) => (
    <EventPillsPill key={e.id} event={e} getIndicator={getIndicator} />
  ))

  return <Pills.Bin title={title}>{items}</Pills.Bin>
}

const EventPillsPill = ({
  event,
  getIndicator,
}: {
  event: ScheduleItem
  getIndicator?: (event: ScheduleItem) => string | undefined
}) => {
  const detailsFunc = useEventDetails()

  const eventProps = useMemo(() => {
    return detailsFunc ? detailsFunc(event) : {}
  }, [event, detailsFunc])

  const indicator = useMemo(() => {
    return getIndicator ? getIndicator(event) : undefined
  }, [event, getIndicator])

  const renderFunc = useCallback(
    (c: ReactNode) => {
      const { onClickEvent, ...other } = eventProps
      return (
        <ItemHoverCard item={event} ItemDetailsProps={other}>
          {c}
        </ItemHoverCard>
      )
    },
    [event, eventProps],
  )

  return (
    <Pills.Pill
      children={event.title}
      href={eventProps.url}
      onClick={eventProps.onClickEvent}
      renderContent={renderFunc}
      className={clsx(
        `Pill-event-id-${event.id}`,
        event.tags ? [...event.tags].map((t) => `Pill-event-tag-${t}`) : [],
      )}
      indicator={indicator}
    />
  )
}

export const binItemsByTime = (
  items: Iterable<ScheduleItem>,
  binMinutes: number,
): readonly EventPillsBin[] => {
  const map = new Map<string, [Date, ScheduleItem[]]>()

  for (const event of items) {
    if (event.start) {
      const binStart = binDate(event.start, binMinutes)
      const binKey = formatISO(binStart)
      let bin = map.get(binKey)
      if (!bin) {
        bin = [binStart, []]
        map.set(binKey, bin)
      }

      bin[1].push(event)
    }
  }

  const bins: EventPillsBin[] = []

  for (const [id, [date, items]] of map.entries()) {
    bins.push({
      id,
      title: format(date, "h:mm aaa"),
      items: items,
    })
  }

  return bins
}

const binDate = (d: Date, binMinutes: number): Date => {
  const tz = d instanceof TZDate ? d.timeZone : undefined
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
