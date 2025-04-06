import {
  ActionIcon,
  Anchor,
  Box,
  BoxProps,
  Flex,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
  useProps,
} from "@mantine/core"
import { Event, Host, TagEntry } from "@open-event-systems/schedule-lib"
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
import {
  makeTagFormatter,
  makeValidTagsFilter,
  useScheduleConfig,
} from "../config/context.js"
import { ShareButton } from "../share-button/share-button.js"

export type EventDetailsProps = {
  event: Event
  bookmarked?: boolean
  setBookmarked?: (set: boolean) => void
  large?: boolean
  bookmarkCount?: number | null
  showShare?: boolean
  url?: string
  locationHref?: string
  onClickLocation?: () => void
} & BoxProps

export const EventDetails = (props: EventDetailsProps) => {
  const {
    className,
    event,
    bookmarked,
    setBookmarked,
    large = false,
    bookmarkCount,
    showShare,
    url,
    locationHref,
    onClickLocation,
    ...other
  } = useProps("EventDetails", {}, props)

  const config = useScheduleConfig()

  const scheme = useMantineColorScheme()
  const altTextColor = scheme.colorScheme == "dark" ? "gray.5" : "gray.7"

  const timeEl =
    event.start && event.end
      ? renderTime(event.start, event.end, altTextColor)
      : null
  const locationEl = event.location
    ? renderLocation(
        event.location,
        locationHref,
        onClickLocation,
        altTextColor,
      )
    : null
  const hostsEl =
    event.hosts && event.hosts.length > 0
      ? renderHosts(event.hosts, altTextColor)
      : null
  const tagsEl =
    event.tags && event.tags.length > 0
      ? renderTags(config.tags, event.tags, altTextColor)
      : null

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
          <Stack className="EventDetails-buttons" align="center" gap={4}>
            {showShare && <ShareButton size={large ? "md" : "sm"} url={url} />}
            <Box className="EventDetails-bookmark">
              <ActionIcon
                title={bookmarked ? "Unbookmark" : "Bookmark This Event"}
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
                  c={altTextColor}
                  fw="bold"
                  className="EventDetails-bookmarkCount"
                >
                  {bookmarkCount}
                </Text>
              )}
            </Box>
          </Stack>
        </Flex>
        <Markdown className="EventDetails-description">
          {event.description}
        </Markdown>
        {tagsEl}
      </Stack>
    </Box>
  )
}

const renderTime = (start: Date, end: Date, c: string): ReactNode => {
  const startStr = format(start, "EEE h:mm aaa")
  const endStr = format(end, "h:mm aaa")
  return (
    <IconText icon={<IconClockHour4 size={18} />} c={c}>
      {startStr} &ndash; {endStr}
    </IconText>
  )
}

const renderLocation = (
  loc: string,
  href?: string,
  onClick?: () => void,
  c?: string,
): ReactNode => {
  let content

  if (!href) {
    content = loc
  } else {
    content = (
      <Anchor href={href} onClick={onClick}>
        {loc}
      </Anchor>
    )
  }

  return (
    <IconText icon={<IconMapPin size={18} />} c={c}>
      {content}
    </IconText>
  )
}

const renderHosts = (h: readonly (string | Host)[], c: string): ReactNode => {
  const hosts: ReactNode[] = []

  h.forEach((h, i) => {
    const el = renderHost(h)
    if (hosts.length > 0) {
      hosts.push(", ")
    }
    hosts.push(<Fragment key={i}>{el}</Fragment>)
  })

  return (
    <IconText icon={<IconUser size={18} />} c={c}>
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
      <Anchor className="EventDetails-host" href={h.url} target="_blank">
        {name}
      </Anchor>
    )
  } else {
    return <>{name}</>
  }
}

const renderTags = (
  validTags: readonly TagEntry[],
  tags: readonly string[],
  c: string,
): ReactElement => {
  const isValidTag = makeValidTagsFilter(validTags)
  const formatTag = makeTagFormatter(validTags)
  const filteredTags = tags.filter(isValidTag)
  const formattedTags = filteredTags.map(formatTag)
  const els: ReactNode[] = []

  formattedTags.forEach((t) => {
    if (els.length > 0) {
      els.push(", ")
    }
    els.push(t)
  })

  if (els.length == 0) {
    return <></>
  }

  return (
    <IconText icon={<IconTag size={18} />} c={c}>
      {els}
    </IconText>
  )
}
