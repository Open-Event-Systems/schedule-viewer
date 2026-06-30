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
import {
  iterToArr,
  type Address,
  type Organization,
  type Person,
  type Place,
} from "@open-event-systems/schedule-lib"
import type { TagConfigEntry } from "../../types.js"

import classes from "./item-details.module.scss"
import type { Dayjs } from "dayjs"
import { formatAddress } from "../../utils.js"

export const itemDetailsButtonOptions = [
  "share",
  "bookmark",
  "visited",
] as const

export type ItemDetailsButtonOption = (typeof itemDetailsButtonOptions)[number]

export type ItemDetailsOccurrence = Readonly<{
  location?: Iterable<string | Place | Address> | undefined
  startDate?: Dayjs | undefined
  endDate?: Dayjs | undefined
}>

export type ItemDetailsProps = {
  itemId?: string | undefined
  name?: ReactNode | undefined
  occurrences?: Iterable<ItemDetailsOccurrence> | undefined
  performer?: Iterable<string | Person | Organization> | undefined
  organizer?: Iterable<string | Person | Organization> | undefined
  description?: string | undefined
  keywords?: Iterable<string> | undefined
  buttonOptions?: Iterable<ItemDetailsButtonOption> | undefined
  bookmarked?: boolean | undefined
  visited?: boolean | undefined
  bookmarkCount?: number | null | undefined
  shareURL?: string | undefined
  onSelectOption?: (option: ItemDetailsButtonOption) => void | undefined
  getLocationProps?:
    | ((location: string | Place | Address) =>
        | {
            href?: string
            children?: ReactNode
            onClick?: (e: MouseEvent) => void
          }
        | undefined)
    | undefined
  tagEntries?: Iterable<TagConfigEntry> | undefined
  large?: boolean | undefined
  renderName?:
    | ((props: ComponentPropsWithoutRef<"h2">) => ReactNode)
    | undefined
} & ItemDetailsRootProps

const _ItemDetails = memo((props: ItemDetailsProps) => {
  const {
    className,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    itemId,
    name,
    occurrences,
    performer,
    organizer,
    description,
    keywords,
    buttonOptions,
    bookmarked,
    visited,
    bookmarkCount,
    shareURL,
    onSelectOption,
    getLocationProps,
    tagEntries,
    large,
    renderName,
    ...other
  } = useProps("ItemDetails", null, props)

  const validTagsFilter = makeValidTagsFilter(tagEntries)
  const tagFormatter = makeTagFormatter(tagEntries)
  const itemTags = iterToArr(keywords).filter(validTagsFilter)

  const allOccEls = []
  let occIdx = 0
  for (const occ of occurrences ?? []) {
    const occEls = []

    const locEls = iterToArr(occ.location).map((loc, i) => {
      const locProps = (getLocationProps ?? defaultGetLocationProps)(loc)
      console.log(locProps)
      return locProps ? (
        <ItemDetails.Location key={i} {...locProps} />
      ) : undefined
    })

    if (occ.startDate || occ.endDate) {
      occEls.push(
        <ItemDetails.Time
          key="time"
          startDate={occ.startDate}
          endDate={occ.endDate}
        />,
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

  const contacts = [...iterToArr(organizer), ...iterToArr(performer)]

  return (
    <ItemDetails.Root className={className} large={large} {...other}>
      <ItemDetails.Header>
        <Title
          renderRoot={renderName}
          className={"ItemDetails-title"}
          order={large ? 2 : 4}
        >
          {name}
        </Title>
        {allOccEls}
        {allOccEls.length > 1 && <ItemDetails.Divider />}
        {contacts.length > 0 && (
          <ItemDetails.Contacts>
            {contacts.map((c, i) =>
              typeof c == "string" ? (
                <ItemDetails.Contact key={i} name={c} />
              ) : (
                <ItemDetails.Contact key={i} name={c.name} url={c.url} />
              ),
            )}
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

export type ItemDetailsTimeProps = {
  startDate?: Dayjs
  endDate?: Dayjs
} & IconTextProps

export const ItemDetailsTime = memo(
  ({ startDate, endDate, ...other }: ItemDetailsTimeProps) => {
    let content: ReactNode

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
            dateTime={noTZFormat(startDate)}
          >
            {startStr}
          </Text>{" "}
          &ndash;{" "}
          <Text component="time" className="end" dateTime={noTZFormat(endDate)}>
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
          dateTime={noTZFormat(startDate)}
        >
          {startStr}
        </Text>
      )
    } else if (endDate) {
      const endStr = endDate.format("ddd MMM D, h:mm a")
      content = (
        <>
          Ends{" "}
          <Text component="time" className="end" dateTime={noTZFormat(endDate)}>
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

ItemDetailsTime.displayName = "ItemDetails.Time"

const noTZFormat = (date: Dayjs): string => date.format("YYYY-MM-DD[T]HH:mm:ss")

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

const defaultGetLocationProps = (loc: string | Place | Address) => {
  if (typeof loc == "string") {
    return { children: loc }
  } else if (loc.type == "Place" && loc.name) {
    return { children: loc.name }
  } else {
    const addr =
      loc.type == "Place" && loc.address
        ? loc.address
        : loc.type == "PostalAddress"
          ? loc
          : undefined
    if (typeof addr == "string") {
      return { children: addr }
    } else if (addr) {
      return { children: formatAddress(addr) }
    }
  }
}

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
