import {
  ActionIcon,
  Anchor,
  Box,
  type BoxProps,
  Text,
  Title,
  useMantineColorScheme,
  useProps,
} from "@mantine/core"
import {
  IconBookmark,
  IconClockHour4,
  IconMapPin,
  IconTag,
  IconUser,
} from "@tabler/icons-react"
import clsx from "clsx"
import { add, differenceInSeconds, format, formatISO } from "date-fns"
import type { MouseEvent, ReactNode } from "react"
import {
  makeTagFormatter,
  makeValidTagsFilter,
  type TagEntry,
} from "../../config/config.js"
import { ShareButton } from "../share-button/share-button.js"
import { Markdown } from "../markdown/markdown.js"
import { IconText } from "../icon-text/icon-text.js"
import type { ScheduleItem } from "@open-event-systems/schedule-lib"

export type ItemDetailsItemType = ScheduleItem &
  Readonly<{
    title?: string
    description?: string
    location?: string
    contacts?: readonly Readonly<{
      name?: string
      url?: string
    }>[]
    tags?: ReadonlySet<string>
  }>

export type ItemDetailsProps = {
  item: ItemDetailsItemType
  large?: boolean
  bookmarked?: boolean
  setBookmarked?: (set: boolean) => void
  bookmarkCount?: number | null
  url?: string
  showShare?: boolean
  locationHref?: string
  onClickLocation?: (e: MouseEvent) => void
  tags?: Iterable<TagEntry>
} & BoxProps

export const ItemDetails = (props: ItemDetailsProps) => {
  const {
    className,
    item,
    bookmarked,
    setBookmarked,
    large = false,
    bookmarkCount,
    showShare,
    url,
    locationHref,
    onClickLocation,
    tags = [],
    ...other
  } = useProps("ItemDetails", {}, props)

  const scheme = useMantineColorScheme()
  const altTextColor = scheme.colorScheme == "dark" ? "gray.5" : "gray.7"

  return (
    <Box
      component="article"
      className={clsx(
        "ItemDetails-root",
        { "ItemDetails-large": large },
        className,
      )}
      {...other}
    >
      <Title className="ItemDetails-title" order={large ? 2 : 4}>
        {item.title}
      </Title>
      <ItemDetails.Time start={item.start} end={item.end} c={altTextColor} />
      <ItemDetails.Location
        href={locationHref}
        onClick={onClickLocation}
        c={altTextColor}
      >
        {item.location}
      </ItemDetails.Location>
      <ItemDetails.Contacts contacts={item.contacts} c={altTextColor} />
      <Box component="menu" className="ItemDetails-buttons">
        {showShare && (
          <li>
            <ShareButton
              className="ItemDetails-shareButton"
              size={large ? "md" : "sm"}
              url={url}
            />
          </li>
        )}
        <Box component="li" className="ItemDetails-bookmark">
          <ActionIcon
            title={bookmarked ? "Unbookmark" : "Bookmark This Event"}
            size={large ? "md" : "sm"}
            variant={bookmarked ? "filled" : "default"}
            className="ItemDetails-bookmarkButton"
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
              className="ItemDetails-bookmarkCount"
            >
              {bookmarkCount}
            </Text>
          )}
        </Box>
      </Box>
      <Markdown className="ItemDetails-description">
        {item.description}
      </Markdown>
      <ItemDetails.Tags tags={tags} eventTags={item.tags} c={altTextColor} />
    </Box>
  )
}

const Contacts = ({
  contacts,
  c,
}: {
  contacts?: readonly Readonly<{ name?: string; url?: string }>[]
  c?: string
}) => {
  if (!contacts || contacts.length == 0) {
    return null
  }

  const children: ReactNode[] = []

  contacts?.forEach((c, i) => {
    if (i > 0) {
      children.push(", ")
    }

    children.push(<ItemDetails.Contact key={i} {...c} />)
  })

  return (
    <IconText
      className="ItemDetails-contacts"
      icon={<IconUser size={18} />}
      c={c}
    >
      {children}
    </IconText>
  )
}

const Contact = ({ name, url }: Readonly<{ name?: string; url?: string }>) => {
  if (url) {
    return (
      <Anchor className="ItemDetails-contact" href={url} target="_blank">
        {name}
      </Anchor>
    )
  } else {
    return <span className="ItemDetails-contact">{name}</span>
  }
}

const Time = ({ start, end, c }: { start?: Date; end?: Date; c?: string }) => {
  let content: ReactNode

  if (start && end) {
    const offsetStart = add(start, { hours: -6 })
    const offsetEnd = add(end, { hours: -6 })
    const multiDay =
      offsetStart.getDate() != offsetEnd.getDate() ||
      differenceInSeconds(offsetEnd, offsetStart) >= 86400
    const startStr = format(start, "EEE MMM d, h:mm aaa")
    const endStr = multiDay
      ? format(end, "EEE MMM d, h:mm aaa")
      : format(end, "h:mm aaa")
    content = (
      <>
        <time className="start" dateTime={formatISO(start)}>
          {startStr}
        </time>{" "}
        &ndash;{" "}
        <time className="end" dateTime={formatISO(end)}>
          {endStr}
        </time>
      </>
    )
  } else if (start) {
    const startStr = format(start, "EEE MMM d, h:mm aaa")
    content = (
      <time className="start" dateTime={formatISO(start)}>
        {startStr}
      </time>
    )
  } else if (end) {
    const endStr = format(end, "EEE MMM d, h:mm aaa")
    content = (
      <>
        Ends{" "}
        <time className="end" dateTime={formatISO(end)}>
          {endStr}
        </time>
      </>
    )
  }

  if (content) {
    return (
      <IconText
        className="ItemDetails-time"
        icon={<IconClockHour4 size={18} />}
        c={c}
      >
        {content}
      </IconText>
    )
  } else {
    return null
  }
}

const Location = ({
  children,
  href,
  onClick,
  c,
}: {
  children?: ReactNode
  href?: string
  onClick?: (e: MouseEvent) => void
  c?: string
}) => {
  if (!children) {
    return null
  }

  let content = children

  if (href) {
    content = (
      <Anchor
        className="ItemDetails-locationLink"
        href={href}
        onClick={onClick}
      >
        {children}
      </Anchor>
    )
  }

  return (
    <IconText
      className="ItemDetails-location"
      icon={<IconMapPin size={18} />}
      c={c}
    >
      {content}
    </IconText>
  )
}

const Tags = ({
  tags = [],
  eventTags,
  c,
}: {
  tags?: Iterable<TagEntry>
  eventTags?: Iterable<string>
  c?: string
}) => {
  const isValidTag = makeValidTagsFilter(tags)
  const formatTag = makeTagFormatter(tags)
  const filteredTags = eventTags ? [...eventTags].filter(isValidTag) : []
  const formattedTags = filteredTags.map(formatTag)
  const els: ReactNode[] = []

  if (formattedTags.length == 0) {
    return null
  }

  formattedTags.forEach((t, i) => {
    if (i > 0) {
      els.push(", ")
    }
    els.push(t)
  })

  return (
    <IconText className="ItemDetails-tags" icon={<IconTag size={18} />} c={c}>
      {els}
    </IconText>
  )
}

ItemDetails.Time = Time
ItemDetails.Location = Location
ItemDetails.Contacts = Contacts
ItemDetails.Contact = Contact
ItemDetails.Tags = Tags
