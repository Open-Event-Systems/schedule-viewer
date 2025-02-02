import {
  Box,
  BoxProps,
  Divider,
  Indicator,
  Title,
  useProps,
} from "@mantine/core"
import { Event } from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { format, parseISO } from "date-fns"
import { MouseEvent, ReactNode, useMemo } from "react"
import { EventHoverCard } from "../hovercard/EventHoverCard.js"

export type PillsProps = {
  events?: Event[]
  getHref?: (event: Event) => string | null | undefined
  getIndicator?: (event: Event) => ReactNode
  onClickEvent?: (e: MouseEvent, event: Event) => void
} & BoxProps

export const Pills = (props: PillsProps) => {
  const {
    className,
    events = [],
    getHref,
    getIndicator,
    onClickEvent,
    ...other
  } = useProps("Pills", {}, props)

  const bins = useMemo(() => makeBins(events), [events])
  const binEls = useMemo(() => {
    const res: ReactNode[] = []
    bins.forEach((evs, b) => {
      const items = evs.map((e) => (
        <Pills.Pill
          key={e.id}
          event={e}
          href={(getHref ? getHref(e) : undefined) ?? undefined}
          indicator={(getIndicator ? getIndicator(e) : undefined) || undefined}
          onClick={onClickEvent ? (ev) => onClickEvent(ev, e) : undefined}
        />
      ))

      const label = format(parseISO(b), "h:mm aaa")

      res.push(
        <Pills.Bin key={b} title={label}>
          {items}
        </Pills.Bin>
      )
    })

    return res
  }, [bins, getHref, getIndicator, onClickEvent])

  return (
    <Box className={clsx("Pills-root", className)} {...other}>
      {binEls}
    </Box>
  )
}

export type PillBinProps = {
  children?: ReactNode
  title?: ReactNode
} & BoxProps

const PillBin = (props: PillBinProps) => {
  const { className, children, title, ...other } = useProps(
    "PillBin",
    {},
    props
  )

  return (
    <Box className={clsx("PillBin-root", className)} {...other}>
      <Title order={6} className="PillBin-title">
        {title}
      </Title>
      <Divider className="PillBin-divider" />
      <Box className="PillBin-pills">{children}</Box>
    </Box>
  )
}

Pills.Bin = PillBin

export type PillProps = {
  event: Event
  indicator?: ReactNode
  href?: string
  onClick?: (e: MouseEvent) => void
} & BoxProps

const Pill = (props: PillProps) => {
  const { className, event, indicator, href, onClick, ...other } = useProps(
    "Pill",
    {},
    props
  )

  const inner = (
    <EventHoverCard event={event}>
      <Box component="a" className="Pill-body" href={href} onClick={onClick}>
        {event.title}
      </Box>
    </EventHoverCard>
  )

  const wrapped = indicator ? (
    <Indicator label={indicator} className="Pill-indicator">
      {inner}
    </Indicator>
  ) : (
    inner
  )

  return (
    <Box className={clsx("Pill-root", className)} {...other}>
      {wrapped}
    </Box>
  )
}

Pills.Pill = Pill

const makeBins = (events: Iterable<Event>): Map<string, Event[]> => {
  const map = new Map<string, Event[]>()
  for (const event of events) {
    if (event.start) {
      const binStr = binDate(event.start).toISOString()
      let bin = map.get(binStr)

      if (!bin) {
        bin = []
        map.set(binStr, bin)
      }

      bin.push(event)
    }
  }

  return map
}

const binDate = (d: Date): Date => {
  const rounded = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes() >= 30 ? 30 : 0,
    0,
    0
  )

  return rounded
}
