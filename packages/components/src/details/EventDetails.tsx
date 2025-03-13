import {
  ActionIcon,
  Anchor,
  Box,
  BoxProps,
  Flex,
  Stack,
  Text,
  Title,
  useProps,
} from "@mantine/core"
import { Event, Host } from "@open-event-systems/schedule-lib"
import {
  IconBookmark,
  IconClockHour4,
  IconMapPin,
  IconTag,
  IconUser,
} from "@tabler/icons-react"
import clsx from "clsx"
import { format } from "date-fns"
import { Fragment, ReactElement, ReactNode } from "react"
import { Markdown } from "../markdown/Markdown.js"
import { IconText } from "../icon-text/icon-text.js"

export type EventDetailsProps = {
  event: Event
  bookmarked?: boolean
  setBookmarked?: (set: boolean) => void
  large?: boolean
  bookmarkCount?: number | null
} & BoxProps

export const EventDetails = (props: EventDetailsProps) => {
  const {
    className,
    event,
    bookmarked,
    setBookmarked,
    large = false,
    bookmarkCount,
    ...other
  } = useProps("EventDetails", {}, props)

  const timeEl =
    event.start && event.end ? renderTime(event.start, event.end) : null
  const locationEl = event.location ? (
    <IconText icon={<IconMapPin size={18} />} c="dimmed">
      {event.location}
    </IconText>
  ) : null
  const hostsEl =
    event.hosts && event.hosts.length > 0 ? renderHosts(event.hosts) : null
  const tagsEl =
    event.tags && event.tags.length > 0 ? renderTags(event.tags) : null

  return (
    <Box
      className={clsx(
        "EventDetails-root",
        { "EventDetails-large": large },
        className,
      )}
      {...other}
    >
      <Stack gap="xs">
        <Flex gap="xs" justify="space-between">
          <Box>
            <Title order={large ? 3 : 6}>{event.title}</Title>
            {timeEl}
            {locationEl}
            {hostsEl}
          </Box>
          <Box className="EventDetails-bookmark">
            <ActionIcon
              size={large ? "md" : "sm"}
              variant={bookmarked ? "filled" : "default"}
              className="EventDetails-bookmarkButton"
              onClick={() => setBookmarked && setBookmarked(!bookmarked)}
            >
              <IconBookmark />
            </ActionIcon>
            {bookmarkCount != null && bookmarkCount >= 1 && (
              <Text
                span
                size="xs"
                c="dimmed"
                fw="bold"
                className="EventDetails-bookmarkCount"
              >
                {bookmarkCount}
              </Text>
            )}
          </Box>
        </Flex>
        <Markdown className="EventDetails-description">
          {event.description}
        </Markdown>
        {tagsEl}
      </Stack>
    </Box>
  )
}

const renderTime = (start: Date, end: Date): ReactNode => {
  const startStr = format(start, "EEE h:mm aaa")
  const endStr = format(end, "h:mm aaa")
  return (
    <IconText icon={<IconClockHour4 size={18} />} c="dimmed">
      {startStr} &ndash; {endStr}
    </IconText>
  )
}

const renderHosts = (h: readonly (string | Host)[]): ReactNode => {
  const hosts: ReactNode[] = []

  h.forEach((h, i) => {
    const el = renderHost(h)
    if (hosts.length > 0) {
      hosts.push(", ")
    }
    hosts.push(<Fragment key={i}>{el}</Fragment>)
  })

  return (
    <IconText icon={<IconUser size={18} />} c="dimmed">
      {hosts}
    </IconText>
  )
}

const renderHost = (h: string | Host): ReactElement => {
  if (typeof h == "string") {
    return <>{h}</>
  }

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

const renderTags = (tags: readonly string[]): ReactElement => {
  const els: ReactNode[] = []

  tags.forEach((t) => {
    if (els.length > 0) {
      els.push(", ")
    }
    els.push(t)
  })

  return (
    <IconText icon={<IconTag size={18} />} c="dimmed">
      {els}
    </IconText>
  )
}
