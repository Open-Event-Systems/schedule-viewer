import { createPolymorphicComponent, useProps } from "@mantine/core"
import {
  memo,
  useCallback,
  useMemo,
  useState,
  type MouseEvent,
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

/**
 * A {@link Pills} component that displays pills for
 * {@link DetailedScheduleItem} objects.
 */
const _ItemPillsMemo = memo((props: ItemPillsProps) => {
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
})

const _ItemPills = createPolymorphicComponent<"div", ItemPillsProps>(
  _ItemPillsMemo,
)

_ItemPillsMemo.displayName = "ItemPills"

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
  renderHoverCard?: (
    props: ItemHoverCardProps & { detailsEnabled?: boolean },
  ) => ReactNode

  onMouseEnter?: (e: MouseEvent) => void
} & Omit<PillProps, "children">

/**
 * A {@link Pills.Pill} that displays a {@link DetailedScheduleItem}.
 */
const _ItemPillsPillMemo = memo((props: ItemPillProps) => {
  const {
    item,
    tags,
    ItemHoverCardProps,
    renderHoverCard,
    onMouseEnter,
    ...other
  } = useProps("ItemPill", { renderHoverCard: defaultRenderHoverCard }, props)

  const [detailsEnabled, setDetailsEnabled] = useState(false)

  const wrappedRenderHoverCard = useCallback(
    ({ children }: { children?: ReactNode }) =>
      renderHoverCard({
        children,
        hideDetails: !detailsEnabled,
        ...omitUndef(ItemHoverCardProps),
        ItemDetailsProps: {
          tags,
          ...omitUndef(ItemHoverCardProps?.ItemDetailsProps),
        },
        item,
      }),
    [renderHoverCard, ItemHoverCardProps, tags, detailsEnabled],
  )

  return (
    <Pills.Pill
      className={clsx("ItemPill-root", ...getItemPillClassNames(item))}
      renderHoverCard={wrappedRenderHoverCard}
      onMouseEnter={(e) => {
        setDetailsEnabled(true)
        onMouseEnter && onMouseEnter(e)
      }}
      {...other}
    >
      {item.title}
    </Pills.Pill>
  )
})

const defaultRenderHoverCard = (props: ItemHoverCardProps) => (
  <ItemHoverCard {...props} />
)

_ItemPillsPillMemo.displayName = "ItemPills.Pill"

export const ItemPillsPill = createPolymorphicComponent<
  "button",
  ItemPillProps
>(_ItemPillsPillMemo)

const omitUndef = <T extends object>(obj?: T): Partial<T> => {
  const newT: Record<string, unknown> = {}

  for (const [k, v] of Object.entries(obj ?? {})) {
    if (v !== undefined) {
      newT[k] = v
    }
  }

  return newT as Partial<T>
}

export const ItemPills = Object.assign(_ItemPills, {
  Pill: ItemPillsPill,
})
