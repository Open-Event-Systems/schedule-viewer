import { useProps } from "@mantine/core"
import { Pill, type PillBinProps, type PillProps } from "./pill.js"
import {
  memo,
  useMemo,
  useState,
  type NamedExoticComponent,
  type ReactNode,
} from "react"
import {
  ItemHoverCard,
  type ItemHoverCardProps,
} from "../hovercard/item-hover-card.js"
import type { TagEntry, TagIndicatorEntry } from "../../types.js"
import { makeTagIndicatorFunc } from "../../config.js"
import clsx from "clsx"
import { getItemPillClassNames } from "./item-pill-utils.js"
import type { DetailedScheduleItem } from "@open-event-systems/schedule-lib"

export type ItemPillProps = Omit<PillProps, "children"> & {
  item: DetailedScheduleItem
  tags?: Iterable<TagEntry>
  ItemHoverCardProps?: Partial<ItemHoverCardProps>
  renderHoverCard?: (props: ItemHoverCardProps) => ReactNode
}

type ItemPillComponentType = NamedExoticComponent<ItemPillProps> & {
  Bin: typeof _ItemPillBin
}

const _ItemPill = memo((props: ItemPillProps) => {
  const defaultRenderHoverCard = (props: ItemHoverCardProps) => {
    const { ItemDetailsProps, ...other } = props

    return (
      <ItemHoverCard
        {...other}
        {...ItemHoverCardProps}
        ItemDetailsProps={{
          tags,
          ...ItemDetailsProps,
        }}
        hideDetails={!detailsEnabled}
        item={item}
      />
    )
  }

  const {
    item,
    tags,
    ItemHoverCardProps,
    renderHoverCard,
    onMouseEnter,
    ...other
  } = useProps("ItemPill", { renderHoverCard: defaultRenderHoverCard }, props)

  const [detailsEnabled, setDetailsEnabled] = useState(false)

  return (
    <Pill
      className={clsx("ItemPill-root", ...getItemPillClassNames(item))}
      onMouseEnter={(e) => {
        onMouseEnter && onMouseEnter(e)
        setDetailsEnabled(true)
      }}
      renderHoverCard={renderHoverCard}
      {...other}
    >
      {item.title}
    </Pill>
  )
}) as Partial<ItemPillComponentType>

_ItemPill.displayName = "ItemPill"

export type ItemPillBinProps = Omit<PillBinProps, "children"> & {
  items: Iterable<DetailedScheduleItem>
  tags?: Iterable<TagEntry>
  tagIndicators?: Iterable<TagIndicatorEntry>
  renderPill?: (props: ItemPillProps) => ReactNode
}

const _ItemPillBin = memo((props: ItemPillBinProps) => {
  const defaultRenderPill = (props: ItemPillProps) => (
    <ItemPill
      key={props.item.id}
      tags={tags}
      indicator={indicatorFunc(props.item.tags ?? [])}
      {...props}
    />
  )

  const { items, tags, tagIndicators, renderPill, ...other } = useProps(
    "ItemPillBin",
    { tagIndicators: [], renderPill: defaultRenderPill },
    props,
  )

  const indicatorFunc = useMemo(
    () => makeTagIndicatorFunc(tagIndicators),
    [tagIndicators],
  )

  return (
    <Pill.Bin {...other}>
      {Array.from(items, (item) => renderPill({ item }))}
    </Pill.Bin>
  )
})

_ItemPillBin.displayName = "ItemPill.Bin"

_ItemPill.Bin = _ItemPillBin

export const ItemPill = _ItemPill as ItemPillComponentType
