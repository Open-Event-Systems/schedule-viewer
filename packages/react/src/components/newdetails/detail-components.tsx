import { Anchor, Box, Divider, Text, useProps } from "@mantine/core"
import {
  IconSection,
  type IconSectionProps,
} from "../icon-section/icon-section.js"
import clsx from "clsx"

import { UserCircleIcon } from "@phosphor-icons/react/dist/icons/UserCircle"
import { InlineList } from "../inline-list/inline-list.js"

import { MapPinIcon } from "@phosphor-icons/react/dist/icons/MapPin"
import type { DefaultBoxProps } from "../types.js"
import {
  Children,
  Fragment,
  isValidElement,
  type MouseEvent,
  type ReactNode,
} from "react"
import type { Dayjs } from "dayjs"
import { formatISO } from "@open-event-systems/schedule-lib"
import { ClockIcon } from "@phosphor-icons/react/dist/icons/Clock"

import { TagIcon } from "@phosphor-icons/react/dist/icons/Tag"

import classes from "./item-details.module.scss"
import { Contact, type ContactProps } from "../contact/contact.js"

export type ItemDetailsOccurrencesProps = DefaultBoxProps & {}

export const ItemDetailsOccurrences = (props: ItemDetailsOccurrencesProps) => {
  const { className, children, ...other } = useProps(
    "ItemDetailsOccurrences",
    null,
    props,
  )

  const newChildren: ReactNode[] = []

  Children.forEach(children, (el, i) => {
    if (isValidElement(el)) {
      newChildren.push(
        <Fragment key={el.key ?? i}>
          {i > 0 && <Divider />}
          {el}
        </Fragment>,
      )
    } else {
      newChildren.push(el)
    }
  })

  const multi = newChildren.length > 1

  if (multi) {
    newChildren.push(<Divider key="endDivider" />)
  }

  return (
    <Box
      className={clsx(
        "ItemDetails-occurrences",
        classes.occurrences,
        className,
      )}
      {...other}
    >
      {multi && (
        <Text span size="xs">
          Multiple sessions:
        </Text>
      )}
      {newChildren}
    </Box>
  )
}

export type ItemDetailsOccurrenceProps = DefaultBoxProps

export const ItemDetailsOccurrence = (props: ItemDetailsOccurrenceProps) => {
  const { className, ...other } = useProps("ItemDetailsOccurrence", null, props)

  return (
    <Box
      className={clsx("ItemDetails-occurrence", classes.occurrence, className)}
      {...other}
    />
  )
}

export type ItemDetailsTimeProps = {
  startDate?: Dayjs
  endDate?: Dayjs
} & DefaultBoxProps

export const ItemDetailsTime = (props: ItemDetailsTimeProps) => {
  const { className, startDate, endDate, ...other } = useProps(
    "ItemDetailsTime",
    null,
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
        >
          {startStr}
        </Text>
        <Text span> &ndash; </Text>
        <Text component="time" className="end" dateTime={formatISO(endDate)}>
          {endStr}
        </Text>
      </>
    )
  } else if (startDate) {
    const startStr = startDate.format("ddd MMM D, h:mm a")
    content = (
      <Text component="time" className="start" dateTime={formatISO(startDate)}>
        {startStr}
      </Text>
    )
  } else if (endDate) {
    const endStr = endDate.format("ddd MMM D, h:mm a")
    content = (
      <>
        Ends{" "}
        <Text component="time" className="end" dateTime={formatISO(endDate)}>
          {endStr}
        </Text>
      </>
    )
  }

  return (
    <IconSection
      className={clsx("ItemDetailsTime-root", className)}
      icon={<ClockIcon />}
      {...other}
    >
      {content}
    </IconSection>
  )
}

export type ItemDetailsLocationsProps = IconSectionProps

export const ItemDetailsLocations = (props: ItemDetailsLocationsProps) => {
  const { className, children, ...other } = useProps(
    "ItemDetailsLocations",
    null,
    props,
  )

  return (
    <IconSection
      className={clsx("ItemDetails-locations", className)}
      icon={<MapPinIcon />}
      {...other}
    >
      <InlineList>{children}</InlineList>
    </IconSection>
  )
}

export type ItemDetailsLocationProps = DefaultBoxProps<"a"> &
  DefaultBoxProps<"span"> & {
    onClickLink?: (e: MouseEvent<HTMLAnchorElement>) => void
  }

export const ItemDetailsLocation = (props: ItemDetailsLocationProps) => {
  const { className, href, onClickLink, children, ...other } = useProps(
    "ItemDetailsLocation",
    null,
    props,
  )

  if (href) {
    return (
      <Anchor
        className={clsx("ItemDetails-location", className)}
        href={href}
        onClick={onClickLink}
        {...other}
      >
        {children}
      </Anchor>
    )
  } else {
    return (
      <Text span className={clsx("ItemDetails-location", className)} {...other}>
        {children}
      </Text>
    )
  }
}

export type ItemDetailsContactsProps = {
  gap?: number | string
} & IconSectionProps

export const ItemDetailsContacts = (props: ItemDetailsContactsProps) => {
  const { className, gap, children, ...other } = useProps(
    "ItemDetailsContacts",
    { gap: "0.5rem" },
    props,
  )

  return (
    <IconSection
      className={clsx("ItemDetails-contacts", classes.contacts, className)}
      classNames={{
        icon: classes.contactsIcon,
      }}
      icon={<UserCircleIcon />}
      {...other}
    >
      <InlineList after={null} gap={gap}>
        {children}
      </InlineList>
    </IconSection>
  )
}

export type ItemDetailsContactProps = ContactProps

export const ItemDetailsContact = (props: ItemDetailsContactProps) => {
  const { className, classNames, ...other } = useProps(
    "ItemDetailsContact",
    null,
    props,
  )

  return (
    <Contact
      className={clsx("ItemDetails-contact", className)}
      classNames={{
        ...classNames,
        icon: clsx(classNames?.icon, classes.contactIcon),
      }}
      {...other}
    />
  )
}

export type ItemDetailsTagsProps = IconSectionProps

export const ItemDetailsTags = (props: ItemDetailsTagsProps) => {
  const { className, children, ...other } = useProps(
    "ItemDetailsTags",
    null,
    props,
  )

  return (
    <IconSection
      className={clsx("ItemDetails-tags", className)}
      icon={<TagIcon />}
      {...other}
    >
      <InlineList>{children}</InlineList>
    </IconSection>
  )
}

export type ItemDetailsTagProps = DefaultBoxProps<"span">

export const ItemDetailsTag = (props: ItemDetailsTagProps) => {
  const { className, ...other } = useProps("ItemDetailsTag", null, props)

  return <Text className={clsx("ItemDetails-tag", className)} span {...other} />
}
