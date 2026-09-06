import {
  Box,
  parseThemeColor,
  useMantineColorScheme,
  useMantineTheme,
  useProps,
  type CSSProperties,
} from "@mantine/core"
import type { DefaultBoxProps } from "../types.js"
import clsx from "clsx"

import {
  ItemDetailsContact,
  ItemDetailsContacts,
  ItemDetailsLocation,
  ItemDetailsLocations,
  ItemDetailsOccurrence,
  ItemDetailsOccurrences,
  ItemDetailsTag,
  ItemDetailsTags,
  ItemDetailsTime,
} from "./detail-components.js"
import { useMemo } from "react"
import { iterToArr } from "@open-event-systems/schedule-lib"

import classes from "./item-details.module.scss"
import type { ContactViewProps, OccurrenceViewProps } from "../../types.js"

const DEFAULT_COLOR = "gray.8"

export type ItemDetailsSize = "sm" | "md" | "lg"

export type ItemDetailsProps = ItemDetailsRootProps & {
  occurrences?: Iterable<OccurrenceViewProps>
  contacts?: Iterable<string | ContactViewProps>
  tags?: Iterable<string>
}

const _ItemDetails = (props: ItemDetailsProps) => {
  const { occurrences, contacts, tags, size, color, style, ...other } =
    useProps("ItemDetails", { color: DEFAULT_COLOR }, props)

  const occurrenceEls = useMemo(() => {
    return iterToArr(occurrences).map((occ, i) => {
      const locEls = iterToArr(occ.locations).map((loc, i) => {
        const { name, href, onClick } =
          typeof loc == "string" ? { name: loc } : loc

        return (
          <ItemDetails.Location key={i} href={href} onClickLink={onClick}>
            {name}
          </ItemDetails.Location>
        )
      })

      const locEl = locEls.length > 0 && (
        <ItemDetails.Locations>{locEls}</ItemDetails.Locations>
      )

      return (
        <ItemDetails.Occurrence key={i}>
          {occ.startDate && occ.endDate && (
            <ItemDetails.Time startDate={occ.startDate} endDate={occ.endDate} />
          )}
          {locEl}
        </ItemDetails.Occurrence>
      )
    })
  }, [occurrences])

  const occurrenceEl = occurrenceEls.length > 0 && (
    <ItemDetails.Occurrences>{occurrenceEls}</ItemDetails.Occurrences>
  )

  const contactEls = useMemo(() => {
    return iterToArr(contacts).map((c, i) => {
      const { name, iconURL, href, onClick } =
        typeof c == "string" ? { name: c } : c

      return (
        <ItemDetails.Contact
          key={i}
          name={name}
          iconURL={iconURL}
          href={href}
          onClickLink={onClick}
        />
      )
    })
  }, [contacts])

  const contactEl = contactEls.length > 0 && (
    <ItemDetails.Contacts>{contactEls}</ItemDetails.Contacts>
  )

  const tagEls = useMemo(() => {
    return iterToArr(tags).map((t, i) => {
      return <ItemDetails.Tag key={i}>{t}</ItemDetails.Tag>
    })
  }, [tags])

  const tagEl = tagEls.length > 0 && (
    <ItemDetails.Tags>{tagEls}</ItemDetails.Tags>
  )

  const theme = useMantineTheme()
  const colorScheme = useMantineColorScheme()

  const cssVars: CSSProperties = {}

  if (color) {
    const colorVal = parseThemeColor({
      color,
      theme,
      colorScheme: colorScheme.colorScheme,
    })
    cssVars["--color"] = colorVal.value
  }

  return (
    <ItemDetails.Root size={size} style={{ ...cssVars, ...style }} {...other}>
      {occurrenceEl}
      {contactEl}
      {tagEl}
    </ItemDetails.Root>
  )
}

export type ItemDetailsRootProps = DefaultBoxProps & {
  size?: ItemDetailsSize
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

export const ItemDetails = Object.assign(_ItemDetails, {
  Root: ItemDetailsRoot,
  Occurrences: ItemDetailsOccurrences,
  Occurrence: ItemDetailsOccurrence,
  Time: ItemDetailsTime,
  Locations: ItemDetailsLocations,
  Location: ItemDetailsLocation,
  Contacts: ItemDetailsContacts,
  Contact: ItemDetailsContact,
  Tags: ItemDetailsTags,
  Tag: ItemDetailsTag,
})
