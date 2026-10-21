import { TagsConfigContext } from "#src/tags.js"
import { useProps } from "@mantine/core"
import clsx from "clsx"
import {
  use,
  useCallback,
  useMemo,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from "react"
import { ItemCard, type ItemCardProps } from "../item-card/item-card.js"
import {
  LazyHoverCard,
  type LazyHoverCardProps,
} from "../lazy-hover-card/lazy-hover-card.js"
import { Pill, type PillProps } from "../pill/pill.js"

import { useScheduleConfig } from "#src/hooks/config.js"
import type { ContactViewProps, LocationViewProps } from "#src/types.js"
import type { SeriesOrOccurrence } from "@open-event-systems/schedule-lib"
import classes from "./item-pill.module.scss"

export type ItemPillProps = PillProps & {
  name?: string
  description?: string
  href?: string
  tags?: Iterable<string>
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  isBookmarked?: boolean
  HoverCardProps?: Partial<LazyHoverCardProps>
  ItemCardProps?: Partial<ItemCardProps>
  renderItemCard?: (props: ItemCardProps) => ReactNode
}

const _ItemPill = (props: ItemPillProps) => {
  const {
    className,
    name,
    description,
    href,
    tags,
    onClick,
    isBookmarked,
    HoverCardProps,
    ItemCardProps,
    renderItemCard,
    ...other
  } = useProps(
    "ItemPill",
    { renderItemCard: ItemPill.defaultRenderItemCard },
    props,
  )

  const tagsConfig = use(TagsConfigContext)
  const { after, before, color, indicator, indicatorColor, textColor } =
    useMemo(() => tagsConfig.getViewProps(...(tags ?? [])), [tagsConfig, tags])

  const renderPillRoot = (
    props: ComponentPropsWithoutRef<"div"> & ComponentPropsWithoutRef<"a">,
  ) => {
    if (href) {
      return <a href={href} onClick={onClick} {...props} />
    } else {
      return <div {...props} />
    }
  }

  const mergedDropdownProps = useMemo(() => {
    return {
      classNames: {
        dropdown: classes.dropdown,
      },
      ...HoverCardProps?.DropdownProps,
    }
  }, [HoverCardProps?.DropdownProps])

  return (
    <LazyHoverCard
      {...HoverCardProps}
      DropdownProps={mergedDropdownProps}
      target={
        <Pill
          className={clsx("ItemPill-root", className)}
          renderRoot={renderPillRoot}
          highlighted={isBookmarked}
          before={before}
          after={after}
          indicator={indicator}
          indicatorColor={indicatorColor}
          color={color}
          textColor={textColor}
          {...other}
        >
          {name}
        </Pill>
      }
    >
      {renderItemCard({
        size: "sm",
        name,
        description,
        tags,
        ...ItemCardProps,
      })}
    </LazyHoverCard>
  )
}

const ItemPillContainer = (
  props: ItemPillProps & { item: SeriesOrOccurrence },
) => {
  const { item, ...other } = props

  const { renderItemCard, getItemHref, onClickItem, getTagViewProps } =
    useScheduleConfig()

  const wrappedRenderItemCard = useCallback(
    (props: ItemCardProps) => {
      return (renderItemCard ?? ItemPill.defaultRenderItemCardForItem)(
        item,
        props,
      )
    },
    [item, renderItemCard],
  )

  const href = useMemo(() => {
    if (getItemHref) {
      const href = getItemHref(item)
      if (href) {
        return href
      }
    }
  }, [item, getItemHref])

  const tagViewProps = useMemo(() => {
    if (getTagViewProps) {
      return getTagViewProps(...item.item.tags)
    }
  }, [item.item.tags, getTagViewProps])

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (onClickItem) {
        onClickItem(e, item)
      }
    },
    [item, onClickItem],
  )

  return (
    <ItemPill
      {...tagViewProps}
      renderItemCard={wrappedRenderItemCard}
      name={item.item.name}
      description={item.item.description}
      hasIndicator={!!tagViewProps?.indicator}
      tags={item.item.tags}
      href={href}
      onClick={onClick}
      {...other}
    />
  )
}

const ItemCardContainer = (
  props: ItemCardProps & { item: SeriesOrOccurrence },
) => {
  const { item, ...other } = props

  const {
    resolveTag,
    resolve,
    data,
    getItemHref,
    getLocationViewProps,
    getContactViewProps,
  } = useScheduleConfig()

  const occurrences = useMemo(() => {
    const occs = []
    for (const occ of item.occurrences ?? []) {
      const locs = []

      for (const locEntry of occ.locations) {
        const loc = resolve(data, "location", locEntry)
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
    return occs
  }, [item.occurrences, data, resolve, getLocationViewProps])

  const contacts = useMemo(() => {
    const cts = []

    if (item.item.type == "event") {
      for (const ct of item.item.contacts) {
        const profile = resolve(data, "profile", ct)
        cts.push(profile ? getContactViewProps(profile.item) : ct.name || ct.id)
      }
    }
    return cts.filter((c): c is string | ContactViewProps => !!c)
  }, [item, data, resolve, getContactViewProps])

  const resolvedTags = useMemo(
    () =>
      Array.from(item.item.tags, (t) => resolveTag(t))
        .map((t) => t?.label)
        .filter((t): t is string => !!t),
    [item.item.tags],
  )

  const itemHref = useMemo(() => {
    if (getItemHref) {
      const href = getItemHref(item)
      if (href) {
        return href
      }
    }
  }, [item, getItemHref])

  return (
    <ItemCard
      name={item.item.name}
      description={item.item.description}
      occurrences={occurrences}
      contacts={contacts}
      tags={resolvedTags}
      shareURL={itemHref}
      {...other}
    />
  )
}

const defaultRenderItemCard = (props: ItemCardProps) => {
  return <ItemCard {...props} />
}

const defaultRenderItemCardForItem = (
  obj: SeriesOrOccurrence,
  props: ItemCardProps,
) => {
  return <ItemCardContainer item={obj} {...props} />
}

const defaultRenderItemPillForItem = (
  obj: SeriesOrOccurrence,
  props: ItemPillProps,
) => {
  return <ItemPillContainer item={obj} {...props} />
}

export const ItemPill = Object.assign(_ItemPill, {
  defaultRenderItemCard,
  defaultRenderItemCardForItem,
  defaultRenderItemPillForItem,
})
