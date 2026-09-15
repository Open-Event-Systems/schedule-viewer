/**
 * {@link ScheduleItem} hooks.
 * @module
 */

import {
  ItemPill,
  type ItemPillProps,
} from "#src/components/item-pill/item-pill.js"
import { useTagsConfig } from "#src/tags.js"
import type {
  ContactViewProps,
  LocationViewProps,
  OccurrenceViewProps,
} from "#src/types.js"
import {
  omitUndef,
  type Contact,
  type OccurrenceLocation,
  type ScheduleData,
  type SeriesOrOccurrence,
} from "@open-event-systems/schedule-lib"
import { createContext, use, useMemo, type ReactNode } from "react"

const emptyIndex = {
  [Symbol.iterator]: () => [][Symbol.iterator](),
  size: 0,
  getById: (): undefined => {},
  getByName: (): undefined => {},
} as const

export const ScheduleDataContext = createContext<ScheduleData>({
  ...emptyIndex,
  getType: () => emptyIndex,
})

export const useScheduleData = (): ScheduleData => use(ScheduleDataContext)

export type RenderItemPillFunc = (obj: SeriesOrOccurrence) => ReactNode

export const defaultRenderItemPill: RenderItemPillFunc = (obj) => {
  return <ItemPillContainer item={obj} />
}

const ItemPillContainer = (
  props: ItemPillProps & { item: SeriesOrOccurrence },
) => {
  const { item, ...otherProps } = props
  const derivedProps = defaultGetItemPillProps(item)

  const { ItemCardProps, ...other } = { ...derivedProps, ...otherProps }

  const tagsConfig = useTagsConfig()

  const wrappedItemCardProps = useMemo(() => {
    const transformedTags = []

    for (const tag of ItemCardProps?.tags ?? []) {
      const config = tagsConfig.get(tag)
      if (config) {
        transformedTags.push(config.label)
      }
    }

    return {
      ...ItemCardProps,
      tags: transformedTags,
    }
  }, [ItemCardProps, tagsConfig])

  return <ItemPill {...other} ItemCardProps={wrappedItemCardProps} />
}

/**
 * Default function to get the {@link ItemPillProps} for an item.
 */
export const defaultGetItemPillProps = (
  obj: SeriesOrOccurrence,
  options?: {
    getContactViewProps?: (contact: Contact) => ContactViewProps | undefined
    getLocationViewProps?: (
      location: OccurrenceLocation,
    ) => LocationViewProps | undefined
  },
): ItemPillProps => {
  const { item, occurrences, startDate, endDate, locations } = {
    occurrences: [],
    ...obj,
  }
  const { name, description, tags } = item
  const { getContactViewProps, getLocationViewProps } = options ?? {}
  const finalGetContactViewProps =
    getContactViewProps ?? defaultGetContactViewProps
  const finalGetLocationViewProps =
    getLocationViewProps ?? defaultGetLocationViewProps

  const contacts: ContactViewProps[] = []
  const occProps: OccurrenceViewProps[] = []

  if (item.type == "event") {
    for (const contact of item.contacts) {
      const contactProps = finalGetContactViewProps(contact)
      if (contactProps) {
        contacts.push(contactProps)
      }
    }
  }

  for (const occ of occurrences) {
    const locs: LocationViewProps[] = []
    for (const loc of occ.locations) {
      const locProps = finalGetLocationViewProps(loc)
      if (locProps) {
        locs.push(locProps)
      }
    }

    occProps.push({
      startDate: occ.startDate,
      endDate: occ.endDate,
      locations: locs,
    })
  }

  if (startDate || endDate || locations) {
    // this is a single occurrence, create a props object to represent it
    const locs: LocationViewProps[] = []
    for (const loc of locations) {
      const locProps = finalGetLocationViewProps(loc)
      if (locProps) {
        locs.push(locProps)
      }
    }

    occProps.push({
      startDate,
      endDate,
      locations: locs,
    })
  }

  return {
    name,
    tags,
    ItemCardProps: {
      name,
      description,
      occurrences: occProps,
      contacts,
      tags,
    },
  }
}

/**
 * Default function to get the {@link ContactViewProps} for a contact.
 */
export const defaultGetContactViewProps = (
  contact: Contact,
): ContactViewProps | undefined => {
  const key = contact.id || contact.name

  if (key) {
    const data = use(ScheduleDataContext).getType("profile")
    const res = data.getById(key) ?? data.getByName(key)

    if (res) {
      return omitUndef({
        name: res.item.name || res.item.id,
        href: res.item.urls[0],
        iconURL: res.item.logo?.url,
      })
    } else {
      return {
        name: key,
      }
    }
  }
}

/**
 * Default function to get the {@link LocationViewProps} for a location.
 */
export const defaultGetLocationViewProps = (
  location: OccurrenceLocation,
): LocationViewProps | undefined => {
  const key = location.id || location.name

  if (key) {
    const data = use(ScheduleDataContext).getType("location")
    const res = data.getById(key) ?? data.getByName(key)

    if (res) {
      return {
        name: res.item.name || res.item.id,
      }
    } else {
      return {
        name: key,
      }
    }
  }
}
