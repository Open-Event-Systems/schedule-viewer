import {
  Box,
  Divider,
  Title,
  useProps,
  type CSSProperties,
  type MantineSize,
} from "@mantine/core"
import type { DefaultBoxProps, RenderRootFunc } from "../types.js"
import clsx from "clsx"

import { Fragment, useMemo, type MouseEvent, type ReactNode } from "react"
import type { Dayjs } from "dayjs"

import classes from "./item-details.module.scss"
import {
  ItemDetailsBookmarkCount,
  ItemDetailsButtons,
  ItemDetailsContact,
  ItemDetailsContacts,
  ItemDetailsDescription,
  ItemDetailsLocation,
  ItemDetailsLocations,
  ItemDetailsOccurrences,
  ItemDetailsTags,
  ItemDetailsTime,
} from "./subcomponents.js"
import { iterToArr } from "@open-event-systems/schedule-lib"

export type ItemDetailsLocationData = Readonly<{
  readonly name?: ReactNode
  readonly href?: string
  readonly onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}>

export type ItemDetailsOccurrence = Readonly<{
  startDate?: Dayjs
  endDate?: Dayjs
  locations?: Iterable<string | ItemDetailsLocationData>
}>

export type ItemDetailsProps = {
  size?: MantineSize
  name?: ReactNode
  description?: string
  startDate?: Dayjs
  endDate?: Dayjs
  locations?: Iterable<string | ItemDetailsLocationData>
  occurrences?: Iterable<ItemDetailsOccurrence>
  contacts?: Iterable<
    | string
    | {
        readonly name?: string
        readonly href?: string
        readonly iconURL?: string
        readonly onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
      }
  >
  tags?: Iterable<string>
  isBookmarked?: boolean
  isVisited?: boolean
  allowBookmark?: boolean
  allowVisited?: boolean
  allowShare?: boolean
  url?: string
  bookmarkCount?: number
  headerImageURL?: string
  onSetBookmarked?: (bookmarked: boolean) => void
  onSetVisited?: (visited: boolean) => void
  renderTitle?: RenderRootFunc
} & ItemDetailsRootProps

const _ItemDetails = (props: ItemDetailsProps) => {
  const {
    size,
    name,
    description,
    startDate,
    endDate,
    locations,
    occurrences,
    contacts,
    tags,
    headerImageURL,
    isBookmarked,
    isVisited,
    allowBookmark,
    allowVisited,
    allowShare,
    url,
    bookmarkCount,
    onSetBookmarked,
    onSetVisited,
    renderTitle,
    ...other
  } = useProps("ItemDetails", null, props)

  const occurrencesEl = useMemo(() => {
    const occEls = iterToArr(occurrences)
      .map((occ, i) => {
        const locEls = iterToArr(occ.locations).map((loc, i) => {
          const { name, href, onClick } =
            typeof loc == "string" ? { name: loc } : loc

          return (
            <ItemDetails.Location
              key={i}
              href={href}
              size={size}
              onClickLink={onClick}
            >
              {name}
            </ItemDetails.Location>
          )
        })

        if (!occ.startDate && !occ.endDate && locEls.length == 0) {
          return
        }

        return (
          <Fragment key={i}>
            {(occ.startDate || occ.endDate) && (
              <ItemDetails.Time
                size={size}
                startDate={occ.startDate}
                endDate={occ.endDate}
              />
            )}
            {locEls.length > 0 && (
              <ItemDetails.Locations size={size}>
                {locEls}
              </ItemDetails.Locations>
            )}
            <Divider />
          </Fragment>
        )
      })
      .filter((el) => !!el)

    if (occEls.length > 0) {
      return (
        <ItemDetails.Occurrences size={size}>{occEls}</ItemDetails.Occurrences>
      )
    }
  }, [occurrences, size])

  const locationEls = useMemo(() => {
    return iterToArr(locations).map((loc, i) => {
      const { name, href, onClick } =
        typeof loc == "string" ? { name: loc } : loc

      return (
        <ItemDetails.Location
          key={i}
          href={href}
          size={size}
          onClickLink={onClick}
        >
          {name}
        </ItemDetails.Location>
      )
    })
  }, [locations, size])

  const contactEls = useMemo(() => {
    return iterToArr(contacts).map((contact, i) => {
      const { name, iconURL, href, onClick } =
        typeof contact == "string" ? { name: contact } : contact

      return (
        <ItemDetails.Contact
          key={i}
          size={size}
          name={name}
          iconURL={iconURL}
          href={href}
          onClickLink={onClick}
        />
      )
    })
  }, [contacts, size])

  const tagsEl = useMemo(() => {
    const tagsArr = iterToArr(tags)
    if (tagsArr.length > 0) {
      return <ItemDetails.Tags tags={tagsArr} size={size} />
    }
  }, [tags, size])

  let headerColor

  if (headerImageURL) {
    headerColor = "white"
  }

  return (
    <ItemDetails.Root size={size} {...other}>
      <ItemDetails.Header headerImageURL={headerImageURL}>
        <Title
          className={clsx("ItemDetails-title", classes.title)}
          order={3}
          c={headerColor}
          size={size}
          renderRoot={renderTitle}
        >
          {name}
        </Title>
        {bookmarkCount && (
          <ItemDetails.BookmarkCount
            size={size}
            color={headerColor}
            count={bookmarkCount}
          />
        )}
      </ItemDetails.Header>
      <ItemDetails.Details>
        {!occurrencesEl && (startDate || endDate) && (
          <ItemDetails.Time
            size={size}
            startDate={startDate}
            endDate={endDate}
          />
        )}
        {!occurrencesEl && locationEls.length > 0 && (
          <ItemDetails.Locations size={size}>
            {locationEls}
          </ItemDetails.Locations>
        )}
        {occurrencesEl}
        {contactEls.length > 0 && (
          <ItemDetails.Contacts size={size}>{contactEls}</ItemDetails.Contacts>
        )}
        {tagsEl}
      </ItemDetails.Details>
      <ItemDetails.Description size={size}>
        {description}
      </ItemDetails.Description>
      <ItemDetails.Buttons
        size={size}
        allowBookmark={allowBookmark}
        allowVisited={allowVisited}
        allowShare={allowShare}
        isBookmarked={isBookmarked}
        isVisited={isVisited}
        url={url}
        onSetBookmarked={onSetBookmarked}
        onSetVisited={onSetVisited}
      />
    </ItemDetails.Root>
  )
}

export type ItemDetailsRootProps = Omit<DefaultBoxProps, "size"> & {
  size?: MantineSize
}

export const ItemDetailsRoot = (props: ItemDetailsRootProps) => {
  const { className, size, ...other } = useProps("ItemDetailsRoot", null, props)

  return (
    <Box
      className={clsx("ItemDetails-root", classes.root, className)}
      data-size={size}
      {...other}
    />
  )
}

export type ItemDetailsHeaderProps = DefaultBoxProps & {
  headerImageURL?: string
}

export const ItemDetailsHeader = (props: ItemDetailsHeaderProps) => {
  const { className, headerImageURL, style, ...other } = useProps(
    "ItemDetailsHeader",
    null,
    props,
  )

  const cssVars: CSSProperties = {}

  if (headerImageURL) {
    cssVars["--image-url"] = `url("${headerImageURL}")`
  }

  return (
    <Box
      className={clsx(
        "ItemDetails-header",
        classes.header,
        !!headerImageURL && classes.hasImage,
        className,
      )}
      style={{
        ...cssVars,
        ...style,
      }}
      {...other}
    />
  )
}

export type ItemDetailsDetailsProps = DefaultBoxProps

export const ItemDetailsDetails = (props: ItemDetailsDetailsProps) => {
  const { className, ...other } = useProps("ItemDetailsDetails", null, props)

  return (
    <Box
      className={clsx("ItemDetails-details", classes.details, className)}
      {...other}
    />
  )
}

export const ItemDetails = Object.assign(_ItemDetails, {
  Root: ItemDetailsRoot,
  Header: ItemDetailsHeader,
  BookmarkCount: ItemDetailsBookmarkCount,
  Details: ItemDetailsDetails,
  Time: ItemDetailsTime,
  Tags: ItemDetailsTags,
  Locations: ItemDetailsLocations,
  Location: ItemDetailsLocation,
  Occurrences: ItemDetailsOccurrences,
  Contacts: ItemDetailsContacts,
  Contact: ItemDetailsContact,
  Description: ItemDetailsDescription,
  Buttons: ItemDetailsButtons,
})
