import { useProps } from "@mantine/core"
import {
  memo,
  useCallback,
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
import { Pills, type PillProps, type PillsProps } from "./pills.js"

export type ItemPillsProps = Omit<PillsProps, "children"> & {
  /**
   * The {@link DetailedScheduleItem} objects to display pills for.
   */
  items: Iterable<DetailedScheduleItem>

  /**
   * A collection of {@link TagEntry} objects which represent the displayable
   * tags.
   */
  tags?: Iterable<TagEntry>

  /**
   * A collection of {@link TagIndicatorEntry} to display.
   */
  tagIndicators?: Iterable<TagIndicatorEntry>

  /**
   * A function to render each pill.
   */
  renderPill?: (props: ItemPillProps) => ReactNode
}

type ItemPillsComponent = NamedExoticComponent<ItemPillsProps> & {
  Pill: typeof ItemPillsPill
}

/**
 * A {@link Pills} component that displays pills for
 * {@link DetailedScheduleItem} objects.
 */
const _ItemPills: Partial<ItemPillsComponent> = memo(
  (props: ItemPillsProps) => {
    const { items, tags, tagIndicators, renderPill, ...other } = useProps(
      "ItemPillBin",
      {},
      props,
    )

    const indicatorFunc = useMemo(
      () => makeTagIndicatorFunc(tagIndicators ?? []),
      [tagIndicators],
    )

    const defaultRenderPill = useCallback(
      (props: ItemPillProps) => (
        <ItemPills.Pill
          key={props.item.id}
          tags={tags}
          indicator={indicatorFunc(props.item.tags ?? [])}
          {...props}
        />
      ),
      [tags, indicatorFunc],
    )

    const renderPillFunc = renderPill ?? defaultRenderPill

    return (
      <Pills {...other}>
        {Array.from(items, (item) => renderPillFunc({ item }))}
      </Pills>
    )
  },
)

_ItemPills.displayName = "ItemPill.Bin"

export type ItemPillProps = {
  /**
   * The {@link DetailedScheduleItem} to display.
   */
  item: DetailedScheduleItem

  /**
   * A collection of {@link TagEntry} objects which represent the displayable
   * tags.
   */
  tags?: Iterable<TagEntry>

  /**
   * Default props for the {@link ItemHoverCard}.
   */
  ItemHoverCardProps?: Partial<ItemHoverCardProps>

  /**
   * Function to render the {@link ItemHoverCard}.
   */
  renderHoverCard?: (props: ItemHoverCardProps) => ReactNode
} & Omit<PillProps, "children">

/**
 * A {@link Pills.Pill} that displays a {@link DetailedScheduleItem}.
 */
export const ItemPillsPill = memo((props: ItemPillProps) => {
  const {
    item,
    tags,
    ItemHoverCardProps,
    renderHoverCard,
    onMouseEnter,
    ...other
  } = useProps("ItemPill", {}, props)

  const [detailsEnabled, setDetailsEnabled] = useState(false)

  const defaultRenderHoverCard = useCallback(
    (props: ItemHoverCardProps) => {
      const { ItemDetailsProps, ...other } = props

      return (
        <ItemHoverCard
          {...omitUndef(ItemHoverCardProps)}
          ItemDetailsProps={{
            tags,
            ...omitUndef(ItemDetailsProps),
          }}
          hideDetails={!detailsEnabled}
          {...omitUndef(other)}
          item={item}
        />
      )
    },
    [ItemHoverCardProps, tags, detailsEnabled],
  )

  return (
    <Pills.Pill
      className={clsx("ItemPill-root", ...getItemPillClassNames(item))}
      onMouseEnter={(e) => {
        onMouseEnter && onMouseEnter(e)
        setDetailsEnabled(true)
      }}
      renderHoverCard={renderHoverCard ?? defaultRenderHoverCard}
      {...other}
    >
      {item.title}
    </Pills.Pill>
  )
})

ItemPillsPill.displayName = "ItemPills.Pill"

const omitUndef = <T extends object>(obj?: T): Partial<T> => {
  const newT: Record<string, unknown> = {}

  for (const [k, v] of Object.entries(obj ?? {})) {
    if (v !== undefined) {
      newT[k] = v
    }
  }

  return newT as Partial<T>
}

_ItemPills.Pill = ItemPillsPill

export const ItemPills = _ItemPills as ItemPillsComponent
