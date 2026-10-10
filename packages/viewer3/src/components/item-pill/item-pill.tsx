import type {
  Contact,
  Profile,
  ScheduleItemIndex,
  SeriesOrOccurrence,
} from "@open-event-systems/schedule-lib"
import {
  ItemPill,
  useScheduleData,
  useTagsConfig,
  type ContactViewProps,
  type ItemPillProps,
} from "@open-event-systems/schedule-react"
import { notFound } from "@tanstack/react-router"
import { useMemo } from "react"

export const ItemPillContainer = (
  props: ItemPillProps & {
    scheduleItemId: string
  },
) => {
  const { scheduleItemId, ItemCardProps, ...other } = props

  const data = useScheduleData()
  const item = data.getById(scheduleItemId)
  if (!item) {
    throw notFound()
  }

  const tagsConfig = useTagsConfig()

  const { name, description, tags } = item.item

  const contacts = "contacts" in item.item ? item.item.contacts : undefined

  const transformedContacts = useMemo(() => {
    const transformedContacts = []

    const profileData = data.getType("profile")

    for (const contact of contacts ?? []) {
      transformedContacts.push(transformContact(profileData, contact))
    }

    return transformedContacts.filter((i) => !!i)
  }, [data, contacts])

  const transformedTags = useMemo(() => {
    const transformedTags = []

    for (const tag of tags ?? []) {
      const tagCfg = tagsConfig.get(tag)
      if (tagCfg) {
        transformedTags.push(tagCfg.label)
      }
    }

    return transformedTags
  }, [data, tagsConfig, tags])

  const mergedCardProps = useMemo(() => {
    return {
      ...ItemCardProps,
      name,
      description,
      contacts: transformedContacts,
      tags: transformedTags,
    }
  }, [ItemCardProps, name, description, transformedContacts, transformedTags])

  return (
    <ItemPill
      name={name}
      tags={tags}
      {...other}
      ItemCardProps={mergedCardProps}
    />
  )
}

export const renderItemPill = (item: SeriesOrOccurrence) => {
  return <ItemPillContainer scheduleItemId={item.item.id} />
}

const transformContact = (
  data: ScheduleItemIndex<Profile>,
  contact: Contact,
): ContactViewProps | undefined => {
  const key = contact.id || contact.name

  if (!key) {
    return
  }

  const res = data.getById(key) ?? data.getByName(key)
  if (!res) {
    return
  }

  return {
    name: res.item.name,
    href: res.item.urls[0],
    iconURL: res.item.logo?.url,
  }
}
