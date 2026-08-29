import {
  Anchor,
  Box,
  Button,
  parseThemeColor,
  Text,
  useMantineColorScheme,
  useMantineTheme,
  useProps,
  type ButtonProps,
  type CSSProperties,
  type MantineSize,
} from "@mantine/core"
import {
  InlineList,
  type InlineListItemProps,
} from "../inline-list/inline-list.js"
import {
  IconSection,
  type IconSectionProps,
} from "../icon-section/icon-section.js"
import { TagIcon } from "@phosphor-icons/react/dist/icons/Tag"

import classes from "./item-details.module.scss"
import clsx from "clsx"
import { MapPinIcon } from "@phosphor-icons/react/dist/icons/MapPin"
import type { AllHTMLAttributes, MouseEvent } from "react"
import { UserCircleIcon } from "@phosphor-icons/react/dist/icons/UserCircle"
import { Contact } from "../contact/contact.js"
import type { Dayjs } from "dayjs"
import { ClockIcon } from "@phosphor-icons/react/dist/icons/Clock"
import { formatISO } from "@open-event-systems/schedule-lib"
import { Markdown, type MarkdownProps } from "../markdown/markdown.js"
import type { DefaultBoxProps } from "../types.js"
import { BookmarkIcon } from "@phosphor-icons/react/dist/icons/Bookmark"
import { EyeIcon } from "@phosphor-icons/react/dist/icons/Eye"
import { ShareButton } from "../share-button/share-button.js"

const DEFAULT_COLOR = "gray.7"

export type ItemDetailsBookmarkCountProps = Omit<
  DefaultBoxProps,
  "children" | "size"
> & {
  size?: MantineSize
  color?: string
  count?: number
}

export const ItemDetailsBookmarkCount = (
  props: ItemDetailsBookmarkCountProps,
) => {
  const { className, size, color, count, style, ...other } = useProps(
    "ItemDetailsBookmarkCount",
    null,
    props,
  )

  const theme = useMantineTheme()
  const scheme = useMantineColorScheme()

  const cssVars: CSSProperties = {}

  if (color) {
    const colorRes = parseThemeColor({
      theme,
      color,
      colorScheme: scheme.colorScheme,
    })
    cssVars["--color"] = colorRes.value
  }

  return (
    <Box
      className={clsx(
        "ItemDetails-bookmarkCount",
        classes.bookmarkCount,
        className,
      )}
      data-size={size}
      style={{
        ...cssVars,
        ...style,
      }}
      {...other}
    >
      <BookmarkIcon
        className={clsx(
          "ItemDetails-bookmarkCountIcon",
          classes.bookmarkCountIcon,
        )}
      />
      <Text span size={size}>
        {count}
      </Text>
    </Box>
  )
}

export type ItemDetailsTimeProps = Omit<IconSectionProps, "children"> & {
  startDate?: Dayjs | null
  endDate?: Dayjs | null
}

export const ItemDetailsTime = (props: ItemDetailsTimeProps) => {
  const { className, color, size, startDate, endDate, ...other } = useProps(
    "ItemDetailsTime",
    { color: DEFAULT_COLOR },
    props,
  )

  let content

  if (startDate && endDate) {
    // TODO: configurable day offset
    const offsetStart = startDate.subtract(6, "hour")
    const offsetEnd = endDate.subtract(6, "hour")
    const multiDay =
      offsetStart.date() != offsetEnd.date() ||
      offsetEnd.unix() - offsetStart.unix() >= 86400
    const startStr = startDate.format("ddd MMM D, h:mm a")
    const endStr = multiDay
      ? endDate.format("ddd MMM D, h:mm a")
      : endDate.format("h:mm a")

    content = (
      <>
        <Text
          component="time"
          className="start"
          dateTime={formatISO(startDate)}
          size={size}
        >
          {startStr}
        </Text>
        <Text span size={size}>
          {" "}
          &ndash;{" "}
        </Text>
        <Text
          component="time"
          className="end"
          dateTime={formatISO(endDate)}
          size={size}
        >
          {endStr}
        </Text>
      </>
    )
  } else if (startDate) {
    const startStr = startDate.format("ddd MMM D, h:mm a")
    content = (
      <Text
        component="time"
        className="start"
        dateTime={formatISO(startDate)}
        size={size}
      >
        {startStr}
      </Text>
    )
  } else if (endDate) {
    const endStr = endDate.format("ddd MMM D, h:mm a")
    content = (
      <>
        Ends{" "}
        <Text
          component="time"
          className="end"
          dateTime={formatISO(endDate)}
          size={size}
        >
          {endStr}
        </Text>
      </>
    )
  }

  return (
    <IconSection
      className={clsx("ItemDetails-time", className)}
      icon={<ClockIcon />}
      color={color}
      size={size}
      {...other}
    >
      {content}
    </IconSection>
  )
}

export type ItemDetailsTagsProps = Omit<IconSectionProps, "children"> & {
  color?: string
  tags?: Iterable<string>
}

export const ItemDetailsTags = (props: ItemDetailsTagsProps) => {
  const { className, size, color, tags, ...other } = useProps(
    "ItemDetailsTags",
    { color: DEFAULT_COLOR },
    props,
  )

  const tagEls = []

  let i = 0
  for (const tag of tags ?? []) {
    tagEls.push(
      <InlineList.Item key={i++}>
        <Text span size={size}>
          {tag}
        </Text>
      </InlineList.Item>,
    )
  }

  return (
    <IconSection
      className={clsx("ItemDetails-tags", classes.tags, className)}
      icon={<TagIcon />}
      size={size}
      color={color}
      {...other}
    >
      <InlineList>{tagEls}</InlineList>
    </IconSection>
  )
}

export type ItemDetailsLocationsProps = IconSectionProps & {
  color?: string
}

export const ItemDetailsLocations = (props: ItemDetailsLocationsProps) => {
  const { className, color, size, children, ...other } = useProps(
    "ItemDetailsLocations",
    { color: DEFAULT_COLOR },
    props,
  )

  return (
    <IconSection
      className={clsx("ItemDetails-locations", classes.locations, className)}
      size={size}
      color={color}
      icon={<MapPinIcon />}
      {...other}
    >
      <InlineList
        className={clsx("ItemDetails-locationsList", classes.locationsList)}
      >
        {children}
      </InlineList>
    </IconSection>
  )
}

export type ItemDetailsLocationProps = Omit<InlineListItemProps, "size"> & {
  size?: MantineSize
  href?: string
  onClickLink?: (e: MouseEvent<HTMLAnchorElement>) => void
}

export const ItemDetailsLocation = (props: ItemDetailsLocationProps) => {
  const { className, size, href, onClickLink, children, ...other } = useProps(
    "ItemDetailsLocation",
    null,
    props,
  )

  let content

  if (href) {
    content = (
      <Anchor size={size} href={href} onClick={onClickLink}>
        {children}
      </Anchor>
    )
  } else {
    content = (
      <Text span size={size}>
        {children}
      </Text>
    )
  }

  return (
    <InlineList.Item
      className={clsx("ItemDetails-location", classes.location, className)}
      {...other}
    >
      {content}
    </InlineList.Item>
  )
}

export type ItemDetailsOccurrencesProps = { size?: MantineSize } & Omit<
  DefaultBoxProps,
  "size"
>

export const ItemDetailsOccurrences = (props: ItemDetailsOccurrencesProps) => {
  const { className, color, size, children, ...other } = useProps(
    "ItemDetailsOccurrences",
    { color: DEFAULT_COLOR },
    props,
  )

  return (
    <Box
      className={clsx(
        "ItemDetails-occurrences",
        classes.occurrences,
        className,
      )}
      {...other}
    >
      <Text span c={color} size={size}>
        Multiple sessions:
      </Text>
      <Box className={classes.occurrencesContent}>{children}</Box>
    </Box>
  )
}

export type ItemDetailsContactsProps = IconSectionProps

export const ItemDetailsContacts = (props: ItemDetailsContactsProps) => {
  const { className, classNames, color, size, children, ...other } = useProps(
    "ItemDetailsContacts",
    { color: DEFAULT_COLOR },
    props,
  )

  return (
    <IconSection
      className={clsx("ItemDetails-contacts", classes.contacts, className)}
      classNames={{
        ...classNames,
        icon: clsx(classNames?.icon, classes.contactsIcon),
      }}
      icon={<UserCircleIcon />}
      color={color}
      size={size}
      {...other}
    >
      <InlineList
        className={clsx("ItemDetails-contactsList", classes.contactsList)}
        after={null}
      >
        {children}
      </InlineList>
    </IconSection>
  )
}

export type ItemDetailsContactProps = Omit<
  InlineListItemProps,
  "children" | "size"
> & {
  size?: MantineSize
  name?: string
  href?: string
  iconURL?: string
  onClickLink?: (e: MouseEvent<HTMLAnchorElement>) => void
}

export const ItemDetailsContact = (props: ItemDetailsContactProps) => {
  const { className, size, name, href, iconURL, onClickLink, ...other } =
    useProps("ItemDetailsContact", null, props)

  return (
    <InlineList.Item
      className={clsx("ItemDetails-contact", classes.contact, className)}
      {...other}
    >
      <Contact
        className={clsx("ItemDetails-contactInner", classes.contactInner)}
        size={size}
        name={name}
        href={href}
        iconURL={iconURL}
        onClickLink={onClickLink}
      />
    </InlineList.Item>
  )
}

export type ItemDetailsDescriptionProps = MarkdownProps & {
  size?: MantineSize
}

export const ItemDetailsDescription = (props: ItemDetailsDescriptionProps) => {
  const { className, size, ...other } = useProps(
    "ItemDetailsDescription",
    null,
    props,
  )

  return (
    <Markdown
      className={clsx(
        "ItemDetails-description",
        classes.description,
        className,
      )}
      data-size={size}
      {...other}
    />
  )
}

export type ItemDetailsButtonsProps = {
  isBookmarked?: boolean
  isVisited?: boolean
  allowBookmark?: boolean
  allowVisited?: boolean
  allowShare?: boolean
  url?: string
  onSetBookmarked?: (bookmarked: boolean) => void
  onSetVisited?: (visited: boolean) => void
  size?: MantineSize
} & Omit<DefaultBoxProps, "children" | "size">

export const ItemDetailsButtons = (props: ItemDetailsButtonsProps) => {
  const {
    className,
    size,
    isBookmarked,
    isVisited,
    allowBookmark,
    allowVisited,
    allowShare,
    url,
    onSetBookmarked,
    onSetVisited,
    ...other
  } = useProps("ItemDetailsButtons", null, props)

  return (
    <Box
      className={clsx(
        "ItemDetails-buttons",
        classes.buttons,
        !allowShare && classes.noShareButton,
        className,
      )}
      data-size={size}
      {...other}
    >
      {allowBookmark && (
        <ToggleButton
          leftSection={<BookmarkIcon />}
          rightSection={<span />}
          justify="space-between"
          enabled={isBookmarked}
          onClick={() => onSetBookmarked && onSetBookmarked(!isBookmarked)}
          size={size}
        >
          {isBookmarked ? "Unbookmark" : "Bookmark"}
        </ToggleButton>
      )}
      {allowVisited && (
        <ToggleButton
          leftSection={<EyeIcon />}
          rightSection={<span />}
          justify="space-between"
          enabled={isVisited}
          onClick={() => onSetVisited && onSetVisited(!isVisited)}
          size={size}
        >
          {isVisited ? "Mark Unvisited" : "Mark Visited"}
        </ToggleButton>
      )}
      {allowShare && (
        <ShareButton
          className={classes.shareButton}
          url={url}
          size={size == "xs" || size == "sm" ? "input-xs" : "input-sm"}
        />
      )}
    </Box>
  )
}

const ToggleButton = (
  props: Omit<ButtonProps, "size"> & {
    enabled?: boolean
    size?: MantineSize
  } & Omit<AllHTMLAttributes<HTMLButtonElement>, "type" | "size">,
) => {
  const { className, enabled, size, ...other } = useProps(
    "ItemDetailsToggleButton",
    {},
    props,
  )

  let mappedSize = "sm"

  if (size == "xs" || size == "sm") {
    mappedSize = "xs"
  }

  return (
    <Button
      className={clsx(
        "ItemDetails-toggleButton",
        classes.toggleButton,
        className,
      )}
      classNames={{
        section: classes.buttonIcon,
      }}
      variant={enabled ? "outline" : "filled"}
      color={enabled ? "red" : undefined}
      type="button"
      size={mappedSize}
      {...other}
    />
  )
}
