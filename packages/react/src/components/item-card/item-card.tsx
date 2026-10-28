import {
  Box,
  Card,
  CloseButton,
  Modal,
  Text,
  Title,
  useProps,
  type CardProps,
  type CloseButtonProps,
  type CSSProperties,
  type ModalProps,
  type TitleProps,
} from "@mantine/core"
import { BookmarkIcon } from "@phosphor-icons/react/dist/icons/Bookmark"
import clsx from "clsx"
import { useMemo, type ReactNode } from "react"
import type {
  ContactViewProps,
  LocationViewProps,
  OccurrenceViewProps,
} from "../../types.js"
import {
  ItemButtons,
  type ItemButtonsFeature,
} from "../item-buttons/item-buttons.js"
import {
  ItemDetails,
  type ItemDetailsProps,
} from "../item-details/item-details.js"
import { Markdown, type MarkdownProps } from "../markdown/markdown.js"
import type { DefaultBoxProps } from "../types.js"

import { useScheduleConfig } from "#src/config.js"
import type { SeriesOrOccurrence } from "@open-event-systems/schedule-lib"
import classes from "./item-card.module.scss"

export type ItemCardSize = "sm" | "md"

export type ItemCardProps = Omit<ItemCardRootProps, "children"> & {
  name?: ReactNode
  description?: string
  occurrences?: Iterable<OccurrenceViewProps>
  contacts?: Iterable<string | ContactViewProps>
  tags?: Iterable<string>
  bookmarkCount?: number
  headerImageURL?: string
  shareURL?: string
  allowClose?: boolean
  enableFeatures?: Iterable<ItemButtonsFeature>
  isBookmarked?: boolean
  isVisited?: boolean
  onSetBookmarked?: (isBookmarked: boolean) => void
  onSetVisited?: (isVisited: boolean) => void
  onClose?: () => void
  size?: ItemCardSize
  ItemDetailsProps?: Partial<ItemDetailsProps>
}

const _ItemCard = (props: ItemCardProps) => {
  const {
    name,
    description,
    headerImageURL,
    occurrences,
    contacts,
    tags,
    bookmarkCount,
    shareURL,
    allowClose,
    enableFeatures,
    isBookmarked,
    isVisited,
    onSetBookmarked,
    onSetVisited,
    onClose,
    size,
    ItemDetailsProps,
    ...other
  } = useProps("ItemCard", null, props)

  return (
    <ItemCard.Root data-size={size} hasClose={allowClose} {...other}>
      <Card.Section component={ItemCard.Header} headerImageURL={headerImageURL}>
        <ItemCard.Title>{name}</ItemCard.Title>
      </Card.Section>
      {allowClose && <ItemCard.CloseButton onClick={onClose} />}
      <ItemCard.Body>
        <ItemCard.Details
          occurrences={occurrences}
          contacts={contacts}
          tags={tags}
          size={size}
          {...ItemDetailsProps}
        />
        <ItemCard.Description>{description}</ItemCard.Description>
      </ItemCard.Body>
      <ItemButtons
        enableFeatures={enableFeatures}
        bookmarkCount={bookmarkCount}
        url={shareURL}
        isBookmarked={isBookmarked}
        isVisited={isVisited}
        onSetBookmarked={onSetBookmarked}
        onSetVisited={onSetVisited}
        variant="vertical"
      />
    </ItemCard.Root>
  )
}

export type ItemCardRootProps = CardProps & {
  hasClose?: boolean
}

export const ItemCardRoot = (props: ItemCardRootProps) => {
  const { className, hasClose, ...other } = useProps(
    "ItemCardRoot",
    null,
    props,
  )

  return (
    <Card
      className={clsx(
        "ItemCard-root",
        classes.root,
        hasClose && classes.hasClose,
        className,
      )}
      {...other}
    />
  )
}

export type ItemCardHeaderProps = DefaultBoxProps & {
  headerImageURL?: string
}

export const ItemCardHeader = (props: ItemCardHeaderProps) => {
  const { className, headerImageURL, style, ...other } = useProps(
    "ItemCardHeader",
    null,
    props,
  )

  const cssVars: CSSProperties = {}

  if (headerImageURL) {
    cssVars["--header-image-url"] = `url("${headerImageURL}")`
  }

  return (
    <Box
      className={clsx(
        "ItemCard-header",
        classes.header,
        headerImageURL && classes.hasHeaderImage,
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

export type ItemCardTitleProps = TitleProps

export const ItemCardTitle = (props: ItemCardTitleProps) => {
  const { className, ...other } = useProps("ItemCardTitle", null, props)

  return (
    <Title
      className={clsx("ItemCard-title", classes.title, className)}
      order={4}
      {...other}
    />
  )
}

export type ItemCardBodyProps = DefaultBoxProps

export const ItemCardBody = (props: ItemCardBodyProps) => {
  const { className, ...other } = useProps("ItemCardBody", null, props)

  return (
    <Box
      className={clsx("ItemCard-body", classes.body, className)}
      {...other}
    />
  )
}

export type ItemCardDetailsProps = ItemDetailsProps

export const ItemCardDetails = (props: ItemCardDetailsProps) => {
  const { className, ...other } = useProps("ItemCardDetails", null, props)

  return (
    <ItemDetails
      className={clsx("ItemCard-details", classes.details, className)}
      {...other}
    />
  )
}

export type ItemCardDescriptionProps = MarkdownProps

export const ItemCardDescription = (props: ItemCardDescriptionProps) => {
  const { className, ...other } = useProps("ItemCardDescription", null, props)

  return (
    <Markdown
      className={clsx("ItemCard-description", classes.description, className)}
      {...other}
    />
  )
}

export type ItemCardBookmarkCountProps = Omit<DefaultBoxProps, "children"> & {
  count?: number
}

export const ItemCardBookmarkCount = (props: ItemCardBookmarkCountProps) => {
  const { className, count, ...other } = useProps(
    "ItemCardBookmarkCount",
    null,
    props,
  )

  return (
    <Box
      className={clsx(
        "ItemCard-bookmarkCount",
        classes.bookmarkCount,
        className,
      )}
      {...other}
    >
      <Box className={classes.bookmarkCountIcon}>
        <BookmarkIcon />
      </Box>
      <Text className={classes.bookmarkCountNumber} span>
        {count}
      </Text>
    </Box>
  )
}

export type ItemCardCloseButtonProps = CloseButtonProps &
  DefaultBoxProps<"button">

export const ItemCardCloseButton = (props: ItemCardCloseButtonProps) => {
  const { className, ...other } = useProps("ItemCardCloseButton", null, props)

  return (
    <CloseButton
      className={clsx("ItemCard-closeButton", classes.closeButton, className)}
      {...other}
    />
  )
}

export type ItemCardModalProps = ItemCardProps & {
  opened: boolean
  onClose: () => void
  ModalProps?: Partial<ModalProps>
}

export const ItemCardModal = (props: ItemCardModalProps) => {
  const { className, opened, onClose, ModalProps, ...other } = useProps(
    "ItemCardModal",
    null,
    props,
  )

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      className={clsx("ItemCard-modal", className)}
      classNames={{
        body: classes.modalBody,
      }}
      {...ModalProps}
    >
      <ItemCard radius={0} allowClose onClose={onClose} {...other} />
    </Modal>
  )
}

const ItemCardContainer = (
  props: ItemCardProps & { data: SeriesOrOccurrence },
) => {
  const { data, ...other } = props

  const {
    resolveTag,
    resolve,
    getItemHref,
    getLocationViewProps,
    getContactViewProps,
  } = useScheduleConfig()

  const occurrences = useMemo(() => {
    const occs = []
    for (const occ of data.occurrences ?? []) {
      const locs = []

      for (const locEntry of occ.locations) {
        const loc = resolve("location", locEntry)
        locs.push(
          loc ? getLocationViewProps(loc.item) : locEntry.name || locEntry.id,
        )
      }

      occs.push({
        startDate: occ.startDate,
        endDate: occ.endDate,
        locations: locs.filter((l): l is string | LocationViewProps => !!l),
      })
    }

    if (data.id != null) {
      // is a single occurrence, add it to the array
      const locs = []
      for (const locEntry of data.locations) {
        const loc = resolve("location", locEntry)
        locs.push(
          loc ? getLocationViewProps(loc.item) : locEntry.name || locEntry.id,
        )
      }

      occs.push({
        startDate: data.startDate,
        endDate: data.endDate,
        locations: locs.filter((l): l is string => !!l),
      })
    }

    return occs
  }, [data.occurrences, data, resolve, getLocationViewProps])

  const contacts = useMemo(() => {
    const cts = []

    if (data.item.type == "event") {
      for (const ct of data.item.contacts) {
        const profile = resolve("profile", ct)
        cts.push(profile ? getContactViewProps(profile.item) : ct.name || ct.id)
      }
    }
    return cts.filter((c): c is string | ContactViewProps => !!c)
  }, [data, data, resolve, getContactViewProps])

  const resolvedTags = useMemo(
    () =>
      Array.from(data.item.tags, (t) => resolveTag(t))
        .map((t) => t?.label)
        .filter((t): t is string => !!t),
    [data.item.tags],
  )

  const itemHref = useMemo(() => {
    if (getItemHref) {
      const href = getItemHref(data)
      if (href) {
        return href
      }
    }
  }, [data, getItemHref])

  return (
    <ItemCard
      {...other}
      name={data.item.name}
      description={data.item.description}
      occurrences={occurrences}
      contacts={contacts}
      shareURL={itemHref}
      tags={resolvedTags}
    />
  )
}

const defaultRenderItemCard = (props: ItemCardProps) => {
  return <ItemCard {...props} />
}

const defaultRenderItemCardForItem = (
  data: SeriesOrOccurrence,
  props: ItemCardProps,
) => {
  return <ItemCardContainer data={data} {...props} />
}

export const ItemCard = Object.assign(_ItemCard, {
  Root: ItemCardRoot,
  Header: ItemCardHeader,
  Title: ItemCardTitle,
  CloseButton: ItemCardCloseButton,
  BookmarkCount: ItemCardBookmarkCount,
  Body: ItemCardBody,
  Details: ItemCardDetails,
  Description: ItemCardDescription,
  Modal: ItemCardModal,
  defaultRenderItemCard,
  defaultRenderItemCardForItem,
})
