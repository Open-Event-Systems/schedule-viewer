import { Event, isScheduled } from "@open-event-systems/schedule-lib"
import { Pills, PillsProps } from "./Pills.js"
import { useProps } from "@mantine/core"
import { format, formatISO } from "date-fns"
import { TZDate } from "@date-fns/tz"
import { makeTagIndicatorFunc, useScheduleConfig } from "../config/context.js"
import { MouseEvent, ReactNode, useCallback, useMemo } from "react"
import { EventHoverCard } from "../hovercard/EventHoverCard.js"
import clsx from "clsx"

// TODO: there is a *lot* of prop drill down in these components, refactor to
// use context

export type EventPillsProps = PillsProps & {
  events: Iterable<Event>
  binMinutes?: number
  getHref?: (event: Event) => string | undefined
  getIsBookmarked?: (event: Event) => boolean
  setBookmarked?: (event: Event, set: boolean) => void
  getBookmarkCount?: (event: Event) => number | undefined
  onClickEvent?: (e: MouseEvent, event: Event) => void
  getLocationHref?: (event: Event) => string | undefined
  onClickLocation?: (event: Event) => void
}

export const EventPills = (props: EventPillsProps) => {
  const {
    className,
    events,
    binMinutes = 30,
    getHref,
    getIsBookmarked,
    setBookmarked,
    getBookmarkCount,
    onClickEvent,
    getLocationHref,
    onClickLocation,
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
          getHref={getHref}
          getIndicator={getIndicator}
          getIsBookmarked={getIsBookmarked}
          setBookmarked={setBookmarked}
          getBookmarkCount={getBookmarkCount}
          onClickEvent={onClickEvent}
          getLocationHref={getLocationHref}
          onClickLocation={onClickLocation}
        />,
      )
    })
    return res
  }, [
    bins,
    getHref,
    getIndicator,
    getIsBookmarked,
    setBookmarked,
    onClickEvent,
    getLocationHref,
    onClickLocation,
  ])

  return <Pills {...other}>{binEls}</Pills>
}

const EventPillsBin = ({
  date,
  events,
  getHref,
  getIndicator,
  getIsBookmarked,
  setBookmarked,
  getBookmarkCount,
  onClickEvent,
  getLocationHref,
  onClickLocation,
}: {
  date: Date
  events: readonly Event[]
  getHref?: (event: Event) => string | undefined
  getIndicator?: (event: Event) => string | undefined
  getIsBookmarked?: (event: Event) => boolean
  setBookmarked?: (event: Event, set: boolean) => void
  getBookmarkCount?: (event: Event) => number | undefined
  onClickEvent?: (ev: MouseEvent, event: Event) => void
  getLocationHref?: (event: Event) => string | undefined
  onClickLocation?: (event: Event) => void
}) => {
  const label = format(date, "h:mm aaa")

  const items = events.map((e) => (
    <EventPillsPill
      key={e.id}
      event={e}
      getHref={getHref}
      getIndicator={getIndicator}
      getIsBookmarked={getIsBookmarked}
      setBookmarked={setBookmarked}
      getBookmarkCount={getBookmarkCount}
      onClickEvent={onClickEvent}
      getLocationHref={getLocationHref}
      onClickLocation={onClickLocation}
    />
  ))

  return <Pills.Bin title={label}>{items}</Pills.Bin>
}

const EventPillsPill = ({
  event,
  getHref,
  getIndicator,
  getIsBookmarked,
  setBookmarked,
  getBookmarkCount,
  onClickEvent,
  getLocationHref,
  onClickLocation,
}: {
  event: Event
  getHref?: (event: Event) => string | undefined
  getIndicator?: (event: Event) => string | undefined
  getIsBookmarked?: (event: Event) => boolean
  setBookmarked?: (event: Event, set: boolean) => void
  getBookmarkCount?: (event: Event) => number | undefined
  onClickEvent?: (ev: MouseEvent, event: Event) => void
  getLocationHref?: (event: Event) => string | undefined
  onClickLocation?: (event: Event) => void
}) => {
  const href = useMemo(() => {
    return getHref ? getHref(event) : undefined
  }, [event, getHref])

  const locHref = useMemo(() => {
    return getLocationHref ? getLocationHref(event) : undefined
  }, [event, getLocationHref])

  const onClickLoc = useMemo(() => {
    return onClickLocation ? () => onClickLocation(event) : undefined
  }, [event, onClickLocation])

  const indicator = useMemo(() => {
    return getIndicator ? getIndicator(event) : undefined
  }, [event, getIndicator])

  const renderFunc = useCallback(
    (c: ReactNode) => {
      return (
        <EventHoverCard
          event={event}
          bookmarked={getIsBookmarked ? getIsBookmarked(event) : undefined}
          setBookmarked={(set) => setBookmarked && setBookmarked(event, set)}
          bookmarkCount={getBookmarkCount ? getBookmarkCount(event) : undefined}
          url={href}
          locationHref={locHref}
          onClickLocation={onClickLoc}
        >
          {c}
        </EventHoverCard>
      )
    },
    [event, getIsBookmarked, setBookmarked, getBookmarkCount],
  )

  const clickHandler = useCallback(
    (e: MouseEvent) => {
      onClickEvent && onClickEvent(e, event)
    },
    [event, onClickEvent],
  )

  return (
    <Pills.Pill
      children={event.title}
      renderContent={renderFunc}
      className={clsx(
        `Pill-event-id-${event.id}`,
        event.tags?.map((t) => `Pill-event-tag-${t}`),
      )}
      href={href}
      indicator={indicator}
      onClick={clickHandler}
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
