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
import { add, differenceInSeconds, format } from "date-fns"
import {
  memo,
  type MouseEvent,
  type NamedExoticComponent,
  type ReactNode,
} from "react"
import { makeTagFormatter, makeValidTagsFilter } from "../../config.js"
import { ShareButton } from "../share-button/share-button.js"
import { Markdown } from "../markdown/markdown.js"
import { IconText } from "../icon-text/icon-text.js"
import type { DetailedScheduleItem } from "@open-event-systems/schedule-lib"
import type { TagEntry } from "../../types.js"

import classes from "./item-details.module.scss"

export type ItemDetailsProps = {
  item: DetailedScheduleItem
  large?: boolean
  bookmarked?: boolean
  setBookmarked?: (set: boolean) => void
  bookmarkCount?: number | null
  url?: string
  showShare?: boolean
  locationHref?: string
  onClickLocation?: (e: MouseEvent) => void
  tags?: Iterable<TagEntry>
  titleComponent?: string
} & BoxProps

type ItemDetailsComponentType = NamedExoticComponent<ItemDetailsProps> & {
  Root: typeof Root
  Time: typeof Time
  Location: typeof Location
  Contacts: typeof Contacts
  Contact: typeof Contact
  Tags: typeof Tags
}

const _ItemDetails = memo((props: ItemDetailsProps) => {
  const {
    className,
    item,
    bookmarked,
    setBookmarked,
    large,
    bookmarkCount,
    showShare,
    url,
    locationHref,
    onClickLocation,
    tags,
    titleComponent,
    ...other
  } = useProps(
    "ItemDetails",
    { large: false, tags: [], titleComponent: "h2" },
    props,
  )

  const scheme = useMantineColorScheme()
  const altTextColor = scheme.colorScheme == "dark" ? "gray.5" : "gray.7"

  return (
    <ItemDetails.Root className={clsx(className, classes.root)} {...other}>
      <Title
        className={clsx("ItemDetails-title", classes.title)}
        component={titleComponent}
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
            title="Bookmark"
            role="switch"
            aria-checked={!!bookmarked}
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
    </ItemDetails.Root>
  )
}) as Partial<ItemDetailsComponentType>

_ItemDetails.displayName = "ItemDetails"

export type ItemDetailsRootProps = {
  large?: boolean
  children?: ReactNode
} & BoxProps

const Root = memo((props: ItemDetailsRootProps) => {
  const { className, large, ...other } = useProps("ItemDetailsRoot", {}, props)
  return (
    <Box
      component="article"
      className={clsx(
        "ItemDetails-root",
        large && ["ItemDetails-large", classes.large],
        classes.root,
        className,
      )}
      {...other}
    />
  )
})

Root.displayName = "ItemDetails.Root"

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

Contacts.displayName = "ItemDetails.Contacts"

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

Contact.displayName = "ItemDetails.Contact"

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
          <time className="start" dateTime={noTZFormat(start)}>
            {startStr}
          </time>{" "}
          &ndash;{" "}
          <time className="end" dateTime={noTZFormat(end)}>
            {endStr}
          </time>
        </>
      )
    } else if (start) {
      const startStr = format(start, "EEE MMM d, h:mm aaa")
      content = (
        <time className="start" dateTime={noTZFormat(start)}>
          {startStr}
        </time>
      )
    } else if (end) {
      const endStr = format(end, "EEE MMM d, h:mm aaa")
      content = (
        <>
          Ends{" "}
          <time className="end" dateTime={noTZFormat(end)}>
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

const noTZFormat = (date: Date): string => format(date, "yyyy-MM-dd'T'HH:mm:ss")

Time.displayName = "ItemDetails.Time"

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

Location.displayName = "ItemDetails.Location"

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

Tags.displayName = "ItemDetails.Tags"

_ItemDetails.Root = Root
_ItemDetails.Time = Time
_ItemDetails.Location = Location
_ItemDetails.Contacts = Contacts
_ItemDetails.Contact = Contact
_ItemDetails.Tags = Tags

export const ItemDetails = _ItemDetails as ItemDetailsComponentType
