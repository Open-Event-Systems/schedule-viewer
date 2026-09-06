import { useProps } from "@mantine/core"
import { Pill, type PillProps } from "../newpill/pill.js"
import clsx from "clsx"
import {
  useMemo,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from "react"
import type { GetTagViewPropsFunc } from "../../hooks/newitems.js"
import { ItemCard, type ItemCardProps } from "../item-card/item-card.js"
import {
  LazyHoverCard,
  type LazyHoverCardProps,
} from "../lazy-hover-card/lazy-hover-card.js"

export type ItemPillProps = PillProps & {
  name?: ReactNode
  href?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  isBookmarked?: boolean
  tags?: Iterable<string>
  getTagViewProps?: GetTagViewPropsFunc
  HoverCardProps?: Partial<LazyHoverCardProps>
  ItemCardProps?: Partial<ItemCardProps>
}

const _ItemPill = (props: ItemPillProps) => {
  const {
    className,
    name,
    href,
    onClick,
    isBookmarked,
    tags,
    getTagViewProps,
    HoverCardProps,
    ItemCardProps,
    ...other
  } = useProps("ItemPill", null, props)

  const { after, before, color, indicator, indicatorColor, textColor } =
    useMemo(
      () =>
        getTagViewProps
          ? (getTagViewProps(tags) ?? { value: "" })
          : { value: "" },
      [tags, getTagViewProps],
    )

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
      p: 0,
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
      <ItemPillDetails ItemCardProps={ItemCardProps} />
    </LazyHoverCard>
  )
}

const ItemPillDetails = (props: { ItemCardProps?: Partial<ItemCardProps> }) => {
  const { ItemCardProps } = props

  return <ItemCard size="sm" {...ItemCardProps} />
}

export const ItemPill = _ItemPill
