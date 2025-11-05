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
import { memo, type MouseEvent, type ReactNode } from "react"
import { makeTagFormatter, makeValidTagsFilter } from "../../config.js"
import { ShareButton } from "../share-button/share-button.js"
import { Markdown } from "../markdown/markdown.js"
import { IconText } from "../icon-text/icon-text.js"
import type { ScheduleItem } from "@open-event-systems/schedule-lib"
import type { TagEntry } from "../../types.js"

import classes from "./item-details.module.scss"

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

export const ItemDetails = (props: ItemDetailsProps) => (
  <ItemDetailsMemo {...props} />
)

const ItemDetailsMemo = memo((props: ItemDetailsProps) => {
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
        {
          "ItemDetails-large": large,
          [`${classes.large}`]: large,
        },
        classes.root,
        className,
      )}
      {...other}
    >
      <Title
        className={clsx("ItemDetails-title", classes.title)}
        order={large ? 2 : 4}
      >
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
      <Box
        component="menu"
        className={clsx("ItemDetails-buttons", classes.buttons)}
      >
        {showShare && (
          <li>
            <ShareButton
              className={clsx("ItemDetails-shareButton", classes.shareButton)}
              size={large ? "md" : "sm"}
              url={url}
            />
          </li>
        )}
        <Box
          component="li"
          className={clsx("ItemDetails-bookmark", classes.bookmark)}
        >
          <ActionIcon
            title={bookmarked ? "Unbookmark" : "Bookmark This Event"}
            size={large ? "md" : "sm"}
            variant={bookmarked ? "filled" : "default"}
            className={clsx(
              "ItemDetails-bookmarkButton",
              classes.bookmarkButton,
            )}
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
              className={clsx(
                "ItemDetails-bookmarkCount",
                classes.bookmarkCount,
              )}
            >
              {bookmarkCount}
            </Text>
          )}
        </Box>
      </Box>
      <Markdown
        className={clsx("ItemDetails-description", classes.description)}
      >
        {item.description}
      </Markdown>
      <ItemDetails.Tags tags={tags} eventTags={item.tags} c={altTextColor} />
    </Box>
  )
})

ItemDetailsMemo.displayName = "ItemDetailsMemo"

const Contacts = memo(
  ({
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
        className={clsx("ItemDetails-contacts", classes.contacts)}
        icon={<IconUser size={18} />}
        c={c}
      >
        {children}
      </IconText>
    )
  },
)

Contacts.displayName = "Contacts"

const Contact = memo(
  ({ name, url }: Readonly<{ name?: string; url?: string }>) => {
    if (url) {
      return (
        <Anchor
          className={clsx("ItemDetails-contact", classes.contact)}
          href={url}
          target="_blank"
        >
          {name}
        </Anchor>
      )
    } else {
      return (
        <span className={clsx("ItemDetails-contact", classes.contact)}>
          {name}
        </span>
      )
    }
  },
)

Contact.displayName = "Contact"

const Time = memo(
  ({ start, end, c }: { start?: Date; end?: Date; c?: string }) => {
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
          className={clsx("ItemDetails-time", classes.time)}
          icon={<IconClockHour4 size={18} />}
          c={c}
        >
          {content}
        </IconText>
      )
    } else {
      return null
    }
  },
)

Time.displayName = "Time"

const Location = memo(
  ({
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
          className={clsx("ItemDetails-locationLink", classes.locationLink)}
          href={href}
          onClick={onClick}
        >
          {children}
        </Anchor>
      )
    }

    return (
      <IconText
        className={clsx("ItemDetails-location", classes.location)}
        icon={<IconMapPin size={18} />}
        c={c}
      >
        {content}
      </IconText>
    )
  },
)

Location.displayName = "Location"

const Tags = memo(
  ({
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
      <IconText
        className={clsx("ItemDetails-tags", classes.tags)}
        icon={<IconTag size={18} />}
        c={c}
      >
        {els}
      </IconText>
    )
  },
)

Tags.displayName = "Tags"

ItemDetails.Time = Time
ItemDetails.Location = Location
ItemDetails.Contacts = Contacts
ItemDetails.Contact = Contact
ItemDetails.Tags = Tags
