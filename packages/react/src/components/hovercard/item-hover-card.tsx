import { HoverCard, type HoverCardProps, useProps } from "@mantine/core"
import { memo, type ReactNode } from "react"
import { ItemDetails, type ItemDetailsProps } from "../details/item-details.js"
import type { ScheduleItem } from "@open-event-systems/schedule-lib"
import clsx from "clsx"

import classes from "./item-hover-card.module.scss"

export type ItemHoverCardProps = HoverCardProps & {
  item?: ScheduleItem
  children?: ReactNode
  ItemDetailsProps?: Partial<ItemDetailsProps>
  classNames?: {
    dropdown?: string
  }
}

export const ItemHoverCard = memo((props: ItemHoverCardProps) => {
  const { item, children, ItemDetailsProps, classNames, ...other } = useProps(
    "ItemHoverCard",
    {},
    props,
  )

  return (
    <HoverCard
      classNames={{
        ...classNames,
        dropdown: clsx(
          "ItemHoverCard-dropdown",
          classes.dropdown,
          classNames?.dropdown,
        ),
      }}
      position="top"
      withArrow
      {...other}
    >
      <HoverCard.Target>{children}</HoverCard.Target>
      <HoverCard.Dropdown>
        {item && <ItemDetails {...ItemDetailsProps} item={item} />}
      </HoverCard.Dropdown>
    </HoverCard>
  )
})

ItemHoverCard.displayName = "ItemHoverCard"
