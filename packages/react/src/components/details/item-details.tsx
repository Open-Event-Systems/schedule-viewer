import {
  ActionIcon,
  Anchor,
  Box,
  type BoxProps,
  Divider,
  type DividerProps,
  Text,
  type TextProps,
  Title,
  useMantineColorScheme,
  useProps,
} from "@mantine/core"
import {
  IconBookmark,
  IconClockHour4,
  IconEyeCheck,
  IconMapPin,
  IconTag,
  IconUser,
} from "@tabler/icons-react"
import clsx from "clsx"
import { add, differenceInSeconds, format } from "date-fns"
import {
  Fragment,
  memo,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from "react"
import { makeTagFormatter, makeValidTagsFilter } from "../../config.js"
import { ShareButton } from "../share-button/share-button.js"
import { Markdown, type MarkdownProps } from "../markdown/markdown.js"
import { IconText, type IconTextProps } from "../icon-text/icon-text.js"
import { iterToArr, type Contact } from "@open-event-systems/schedule-lib"
import type { TagConfigEntry } from "../../types.js"

import classes from "./item-details.module.scss"

export const itemDetailsButtonOptions = [
  "share",
  "bookmark",
  "visited",
] as const

export type ItemDetailsButtonOption = (typeof itemDetailsButtonOptions)[number]

export type ItemDetailsOccurrence = Readonly<{
  location?: Iterable<string>
  start?: Date
  end?: Date
}>

export type ItemDetailsProps = {
  itemId: string
  title?: ReactNode
  occurrences?: Iterable<ItemDetailsOccurrence>
  contacts?: Iterable<Contact>
  description?: string
  tags?: Iterable<string>
  buttonOptions?: Iterable<ItemDetailsButtonOption>
  bookmarked?: boolean
  visited?: boolean
  bookmarkCount?: number | null
  shareURL?: string
  onSelectOption?: (option: ItemDetailsButtonOption) => void
  getLocationProps?: (
    location: string,
  ) => { href?: string; onClick?: (e: MouseEvent) => void } | undefined
  tagEntries?: Iterable<TagConfigEntry>
  large?: boolean
  renderTitle?: (props: ComponentPropsWithoutRef<"h2">) => ReactNode
} & ItemDetailsRootProps

const _ItemDetails = memo((props: ItemDetailsProps) => {
  const {
    className,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    itemId,
    title,
    occurrences,
    contacts,
    description,
    tags,
    buttonOptions,
    bookmarked,
    visited,
    bookmarkCount,
    shareURL,
    onSelectOption,
    getLocationProps,
    tagEntries,
    large,
    renderTitle,
    ...other
  } = useProps("ItemDetails", null, props)

  const validTagsFilter = makeValidTagsFilter(tagEntries)
  const tagFormatter = makeTagFormatter(tagEntries)
  const itemTags = iterToArr(tags).filter(validTagsFilter)

  const contactArr = iterToArr(contacts)

  const allOccEls = []
  let occIdx = 0
  for (const occ of occurrences ?? []) {
    const occEls = []

    const locEls = iterToArr(occ.location).map((loc, i) => {
      const locProps = getLocationProps && getLocationProps(loc)
      return (
        <ItemDetails.Location key={i} {...locProps}>
          {loc}
        </ItemDetails.Location>
      )
    })

    if (occ.start || occ.end) {
      occEls.push(
        <ItemDetails.Time key="time" start={occ.start} end={occ.end} />,
      )
    }

    if (locEls.length > 0) {
      occEls.push(
        <ItemDetails.Locations key="locs">{locEls}</ItemDetails.Locations>,
      )
    }

    if (occIdx > 0) {
      allOccEls.push(<ItemDetails.Divider key={`div-${occIdx}`} />)
    }

    allOccEls.push(<Fragment key={`occ-${occIdx}`}>{occEls}</Fragment>)
    occIdx++
  }

  return (
    <ItemDetails.Root className={className} large={large} {...other}>
      <ItemDetails.Header>
        <Title
          renderRoot={renderTitle}
          className={"ItemDetails-title"}
          order={large ? 2 : 4}
        >
          {title}
        </Title>
        {allOccEls}
        {allOccEls.length > 1 && <ItemDetails.Divider />}
        {contactArr && contactArr.length > 0 && (
          <ItemDetails.Contacts>
            {contactArr.map((c, i) => (
              <ItemDetails.Contact key={i} name={c.name} url={c.url} />
            ))}
          </ItemDetails.Contacts>
        )}
      </ItemDetails.Header>
      <ItemDetails.Body>
        {description && (
          <ItemDetails.Description>{description}</ItemDetails.Description>
        )}
      </ItemDetails.Body>
      {itemTags.length > 0 && (
        <ItemDetails.Tags tags={itemTags.map(tagFormatter)} />
      )}
      <ItemDetails.Buttons
        large={large}
        enableOptions={buttonOptions}
        shareURL={shareURL}
        bookmarked={bookmarked}
        bookmarkCount={bookmarkCount}
        visited={visited}
        onSelectOption={onSelectOption}
      />
    </ItemDetails.Root>
  )
})

_ItemDetails.displayName = "ItemDetails"

export type ItemDetailsRootProps = {
  large?: boolean
  children?: ReactNode
} & BoxProps &
  ComponentPropsWithoutRef<"article">

export const ItemDetailsRoot = memo((props: ItemDetailsRootProps) => {
  const { className, large, ...other } = useProps("ItemDetailsRoot", {}, props)

  const scheme = useMantineColorScheme()

  return (
    <Box
      component="article"
      className={clsx(
        "ItemDetails-root",
        large && ["ItemDetails-large", classes.large],
        classes.root,
        scheme.colorScheme == "dark" && classes.dark,
        className,
      )}
      {...other}
    />
  )
})

ItemDetailsRoot.displayName = "ItemDetails.Root"

export type ItemDetailsHeaderProps = BoxProps & ComponentPropsWithoutRef<"div">

export const ItemDetailsHeader = memo((props: ItemDetailsHeaderProps) => {
  const { className, ...other } = useProps("ItemDetailsHeader", null, props)

  return (
    <Box
      className={clsx("ItemDetails-header", classes.header, className)}
      {...other}
    />
  )
})

ItemDetailsHeader.displayName = "ItemDetails.Header"

export type ItemDetailsBodyProps = BoxProps & ComponentPropsWithoutRef<"div">

export const ItemDetailsBody = memo((props: ItemDetailsBodyProps) => {
  const { className, ...other } = useProps("ItemDetailsBody", null, props)

  return (
    <Box
      className={clsx("ItemDetails-body", classes.body, className)}
      {...other}
    />
  )
})

ItemDetailsBody.displayName = "ItemDetails.Body"

export const ItemDetailsDivider = ({ className, ...other }: DividerProps) => (
  <Divider className={clsx("ItemDetails-divider", className)} {...other} />
)

export type ItemDetailsButtonsProps = {
  onSelectOption?: (option: ItemDetailsButtonOption) => void
  enableOptions?: Iterable<ItemDetailsButtonOption>
  shareURL?: string
  bookmarked?: boolean
  bookmarkCount?: number | null
  visited?: boolean
  large?: boolean
} & BoxProps &
  ComponentPropsWithoutRef<"menu">

export const ItemDetailsButtons = memo((props: ItemDetailsButtonsProps) => {
  const {
    className,
    onSelectOption,
    enableOptions,
    shareURL,
    bookmarked,
    bookmarkCount,
    visited,
    large,
    ...other
  } = useProps("ItemDetailsButtons", null, props)

  const optsArr = iterToArr(enableOptions)

  return (
    <Box
      component="menu"
      className={clsx("ItemDetails-buttons", classes.buttons, className)}
      {...other}
    >
      {optsArr.includes("share") && (
        <Box
          component="li"
          className={clsx("ItemDetails-buttonItem", classes.buttonItem)}
        >
          <ShareButton
            className={clsx("ItemDetails-button", classes.button)}
            size={large ? "lg" : "sm"}
            url={shareURL}
          />
        </Box>
      )}
      {optsArr.includes("visited") && (
        <Box
          component="li"
          className={clsx("ItemDetails-buttonItem", classes.buttonItem)}
        >
          <ActionIcon
            title="Visited"
            role="switch"
            aria-checked={!!visited}
            size={large ? "lg" : "sm"}
            variant={visited ? "filled" : "default"}
            className={clsx("ItemDetails-button", classes.button)}
            onClick={() => onSelectOption && onSelectOption("visited")}
          >
            <IconEyeCheck />
          </ActionIcon>
        </Box>
      )}
      {optsArr.includes("bookmark") && (
        <>
          <Box
            component="li"
            className={clsx("ItemDetails-buttonItem", classes.buttonItem)}
          >
            <ActionIcon
              title="Bookmark"
              role="switch"
              aria-checked={!!bookmarked}
              size={large ? "lg" : "sm"}
              variant={bookmarked ? "filled" : "default"}
              className={clsx("ItemDetails-button", classes.button)}
              onClick={() => onSelectOption && onSelectOption("bookmark")}
            >
              <IconBookmark />
            </ActionIcon>
          </Box>
          {bookmarkCount != null && bookmarkCount >= 1 && (
            <Text
              component="li"
              size="xs"
              fw="bold"
              className={clsx(
                "ItemDetails-buttonItem",
                "ItemDetails-count",
                classes.buttonItem,
                classes.count,
              )}
            >
              {bookmarkCount}
            </Text>
          )}
        </>
      )}
    </Box>
  )
})

ItemDetailsButtons.displayName = "ItemDetails.Buttons"

export type ItemDetailsContactsProps = IconTextProps

export const ItemDetailsContacts = memo((props: ItemDetailsContactsProps) => {
  const { className, ...other } = useProps("ItemDetailsContacts", null, props)
  return (
    <IconText
      renderText={({ className, ...props }) => (
        <ul
          className={clsx(
            "ItemDetails-contactsContainer",
            classes.contactsContainer,
            className,
          )}
          {...props}
        />
      )}
      className={clsx("ItemDetails-contacts", classes.contacts, className)}
      icon={<IconUser size={18} />}
      {...other}
    />
  )
})

ItemDetailsContacts.displayName = "ItemDetails.Contacts"

export type ItemDetailsContactProps = {
  name?: string
  url?: string
}

const ItemDetailsContact = memo(({ name, url }: ItemDetailsContactProps) => {
  let content: ReactNode = name || url

  if (url) {
    content = (
      <Anchor
        className={clsx("ItemDetails-contactLink", classes.contactLink)}
        href={url}
        target="_blank"
      >
        {name || url}
      </Anchor>
    )
  }

  return (
    <Text
      component="li"
      className={clsx("ItemDetails-contact", classes.contact)}
    >
      {content}
    </Text>
  )
})

ItemDetailsContact.displayName = "ItemDetails.Contact"

export type ItemDetailsTimeProps = { start?: Date; end?: Date } & IconTextProps

export const ItemDetailsTime = memo(
  ({ start, end, ...other }: ItemDetailsTimeProps) => {
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
          <Text component="time" className="start" dateTime={noTZFormat(start)}>
            {startStr}
          </Text>{" "}
          &ndash;{" "}
          <Text component="time" className="end" dateTime={noTZFormat(end)}>
            {endStr}
          </Text>
        </>
      )
    } else if (start) {
      const startStr = format(start, "EEE MMM d, h:mm aaa")
      content = (
        <Text component="time" className="start" dateTime={noTZFormat(start)}>
          {startStr}
        </Text>
      )
    } else if (end) {
      const endStr = format(end, "EEE MMM d, h:mm aaa")
      content = (
        <>
          Ends{" "}
          <Text component="time" className="end" dateTime={noTZFormat(end)}>
            {endStr}
          </Text>
        </>
      )
    }

    if (content) {
      return (
        <IconText
          className={clsx("ItemDetails-time", classes.time)}
          icon={<IconClockHour4 size={18} />}
          {...other}
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

ItemDetailsTime.displayName = "ItemDetails.Time"

export type ItemDetailsLocationsProps = IconTextProps &
  ComponentPropsWithoutRef<"ul">

export const ItemDetailsLocations = memo((props: ItemDetailsLocationsProps) => {
  const { className, ...other } = useProps("ItemDetailsLocations", null, props)

  return (
    <IconText
      renderText={({ className, ...props }) => (
        <ul
          className={clsx(
            "ItemDetails-locationsContainer",
            classes.locationsContainer,
            className,
          )}
          {...props}
        />
      )}
      className={clsx("ItemDetails-locations", classes.locations, className)}
      icon={<IconMapPin size={18} />}
      {...other}
    />
  )
})

ItemDetailsLocations.displayName = "ItemDetails.Locations"

export type ItemDetailsLocationProps = {
  children?: ReactNode
  href?: string
  onClick?: (e: MouseEvent) => void
} & TextProps

export const ItemDetailsLocation = memo(
  ({ children, href, onClick, ...other }: ItemDetailsLocationProps) => {
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
      <Text
        component="li"
        className={clsx("ItemDetails-location", classes.location)}
        {...other}
      >
        {content}
      </Text>
    )
  },
)

ItemDetailsLocation.displayName = "ItemDetails.Location"

export type ItemDetailsDescriptionProps = MarkdownProps &
  ComponentPropsWithoutRef<"div">

export const ItemDetailsDescription = memo(
  (props: ItemDetailsDescriptionProps) => {
    const { className, ...other } = useProps(
      "ItemDetailsDescription",
      null,
      props,
    )

    return (
      <Markdown
        className={clsx("ItemDetails-description", className)}
        {...other}
      />
    )
  },
)

ItemDetailsDescription.displayName = "ItemDetailsDescription"

export type ItemDetailsTagsProps = {
  tags?: Iterable<string>
} & Omit<IconTextProps, "children">

export const ItemDetailsTags = memo((props: ItemDetailsTagsProps) => {
  const { tags, ...other } = useProps("ItemDetailsTags", null, props)

  return (
    <IconText
      renderText={({ className, ...props }) => (
        <ul
          className={clsx(
            "ItemDetails-tagsContainer",
            classes.tagsContainer,
            className,
          )}
          {...props}
        />
      )}
      className={clsx("ItemDetails-tags", classes.tags)}
      icon={<IconTag size={18} />}
      {...other}
    >
      {iterToArr(tags).map((tag) => (
        <Text
          key={tag}
          component="li"
          className={clsx("ItemDetails-tag", classes.tag)}
        >
          {tag}
        </Text>
      ))}
    </IconText>
  )
})

ItemDetailsTags.displayName = "ItemDetails.Tags"

export const ItemDetails = Object.assign(_ItemDetails, {
  Root: ItemDetailsRoot,
  Header: ItemDetailsHeader,
  Body: ItemDetailsBody,
  Divider: ItemDetailsDivider,
  Buttons: ItemDetailsButtons,
  Time: ItemDetailsTime,
  Locations: ItemDetailsLocations,
  Location: ItemDetailsLocation,
  Contacts: ItemDetailsContacts,
  Contact: ItemDetailsContact,
  Description: ItemDetailsDescription,
  Tags: ItemDetailsTags,
})
