import {
  Event,
  isScheduled,
  makeId,
  TagIndicatorEntry,
} from "@open-event-systems/schedule-lib"
import { Pills, PillsProps } from "./Pills.js"
import { useProps } from "@mantine/core"
import { format, formatISO } from "date-fns"
import { TZDate } from "@date-fns/tz"
import { useScheduleConfig } from "../config/context.js"
import { MouseEvent, ReactNode, useMemo } from "react"
import { EventHoverCard } from "../hovercard/EventHoverCard.js"
import clsx from "clsx"

export type EventPillsProps = PillsProps & {
  events: Iterable<Event>
  getHref?: (event: Event) => string | null | undefined
  getIsBookmarked?: (event: Event) => boolean | undefined
  setBookmarked?: (event: Event, set: boolean) => void
  getBookmarkCount?: (event: Event) => number | undefined | null
  onClickEvent?: (e: MouseEvent, event: Event) => void
}

export const EventPills = (props: EventPillsProps) => {
  const {
    className,
    events,
    getHref,
    getIsBookmarked,
    setBookmarked,
    getBookmarkCount,
    onClickEvent,
    ...other
  } = useProps("EventPills", {}, props)

  const config = useScheduleConfig()

  const bins = useMemo(() => makeBins(events, config.timeZone), [events])

  const binEls = useMemo(() => {
    const res: ReactNode[] = []
    bins.forEach(([date, evs], b) => {
      const items = evs.map((e) => (
        <Pills.Pill
          key={e.id}
          children={e.title}
          renderContent={(c) => (
            <EventHoverCard
              event={e}
              bookmarked={getIsBookmarked ? getIsBookmarked(e) : undefined}
              setBookmarked={(set) => setBookmarked && setBookmarked(e, set)}
              bookmarkCount={getBookmarkCount ? getBookmarkCount(e) : undefined}
            >
              {c}
            </EventHoverCard>
          )}
          className={clsx(
            `Pill-event-id-${e.id}`,
            e.tags?.map((t) => `Pill-event-tag-${makeId(t)}`)
          )}
          href={(getHref ? getHref(e) : undefined) ?? undefined}
          indicator={getIndicator(config.tagIndicators, e.tags ?? [])}
          onClick={onClickEvent ? (ev) => onClickEvent(ev, e) : undefined}
        />
      ))

      const label = format(date, "h:mm aaa")

      res.push(
        <Pills.Bin key={b} title={label}>
          {items}
        </Pills.Bin>
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
  ])

  return <Pills {...other}>{binEls}</Pills>
}

const makeBins = (
  events: Iterable<Event>,
  tz: string
): Map<string, [Date, Event[]]> => {
  const map = new Map<string, [Date, Event[]]>()
  for (const event of events) {
    if (isScheduled(event)) {
      const date = binDate(event.start, tz)
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

const binDate = (d: Date, tz: string): Date => {
  const rounded = new TZDate(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes() >= 30 ? 30 : 0,
    tz
  )

  return rounded
}

export const getIndicator = (
  tagEntries: readonly TagIndicatorEntry[],
  tags: readonly string[]
): ReactNode => {
  let cur = null

  const normTags = tags.map(makeId)

  for (const [match, label] of tagEntries) {
    const matched =
      (typeof match == "string" && normTags.includes(makeId(match))) ||
      (Array.isArray(match) && match.every((t) => normTags.includes(makeId(t))))
    if (matched) {
      cur = label
    }
  }

  return cur
}
