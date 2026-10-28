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

import { useScheduleConfig } from "#src/config.js"
import type { SeriesOrOccurrence } from "@open-event-systems/schedule-lib"
import classes from "./item-pill.module.scss"

export type ItemPillProps = PillProps & {
  itemId?: string
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
    itemId,
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
    { renderItemCard: ItemCard.defaultRenderItemCard },
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
          data-item-id={itemId}
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
      return (renderItemCard ?? ItemCard.defaultRenderItemCardForItem)(
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
      {...other}
      {...tagViewProps}
      itemId={item.item.id}
      renderItemCard={wrappedRenderItemCard}
      name={item.item.name}
      description={item.item.description}
      hasIndicator={!!tagViewProps?.indicator}
      tags={item.item.tags}
      href={href}
      onClick={onClick}
    />
  )
}

const defaultRenderItemPillForItem = (
  obj: SeriesOrOccurrence,
  props: ItemPillProps,
) => {
  return <ItemPillContainer item={obj} {...props} />
}

export const ItemPill = Object.assign(_ItemPill, {
  defaultRenderItemPillForItem,
})
