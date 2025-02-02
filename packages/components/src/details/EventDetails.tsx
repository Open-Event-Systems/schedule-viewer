import {
  Anchor,
  Box,
  BoxProps,
  Flex,
  Text,
  Title,
  useProps,
} from "@mantine/core"
import { Event, Host } from "@open-event-systems/schedule-lib"
import {
  IconClockHour4,
  IconMapPin,
  IconTag,
  IconUser,
} from "@tabler/icons-react"
import clsx from "clsx"
import { format } from "date-fns"
import { Fragment, ReactElement, ReactNode } from "react"

export type EventDetailsProps = {
  event: Event
} & BoxProps

export const EventDetails = (props: EventDetailsProps) => {
  const { className, event, ...other } = useProps("EventDetails", {}, props)

  const timeEl =
    event.start && event.end ? renderTime(event.start, event.end) : null
  const locationEl = event.location ? (
    <IconText icon={<IconMapPin size={18} />}>{event.location}</IconText>
  ) : null
  const hostsEl =
    event.hosts && event.hosts.length > 0 ? renderHosts(event.hosts) : null
  const tagsEl =
    event.tags && event.tags.length > 0 ? renderTags(event.tags) : null

  return (
    <Box className={clsx("EventDetails-root", className)} {...other}>
      <Title order={6}>{event.title}</Title>
      {timeEl}
      {locationEl}
      {hostsEl}
      <Text className="EventDetails-description">{event.description}</Text>
      {tagsEl}
    </Box>
  )
}

const IconText = ({
  children,
  icon,
}: {
  children?: ReactNode
  icon?: ReactNode
}) => {
  return (
    <Flex align="center" c="dimmed" gap={4}>
      {icon}
      <Text size="sm" lh={1}>
        {children}
      </Text>
    </Flex>
  )
}

const renderTime = (start: Date, end: Date): ReactNode => {
  const startStr = format(start, "EEE h:mm aaa")
  const endStr = format(end, "h:mm aaa")
  return (
    <IconText icon={<IconClockHour4 size={18} />}>
      {startStr} &ndash; {endStr}
    </IconText>
  )
}

const renderHosts = (h: Host[]): ReactNode => {
  const hosts: ReactNode[] = []

  h.forEach((h, i) => {
    const el = renderHost(h)
    if (hosts.length > 0) {
      hosts.push(", ")
    }
    hosts.push(<Fragment key={i}>{el}</Fragment>)
  })

  return <IconText icon={<IconUser size={18} />}>{hosts}</IconText>
}

const renderHost = (h: Host): ReactElement => {
  const name = h.name || h.url
  if (h.url) {
    return (
      <Anchor href={h.url} target="_blank">
        {name}
      </Anchor>
    )
  } else {
    return <>{name}</>
  }
}

const renderTags = (tags: string[]): ReactElement => {
  const els: ReactNode[] = []

  tags.forEach((t) => {
    if (els.length > 0) {
      els.push(", ")
    }
    els.push(t)
  })

  return <IconText icon={<IconTag size={18} />}>{els}</IconText>
}
