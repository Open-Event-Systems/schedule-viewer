import { HoverCard, type HoverCardProps, useProps } from "@mantine/core"
import { memo, type ReactNode } from "react"
import { ItemDetails, type ItemDetailsProps } from "../details/item-details.js"
import clsx from "clsx"

import classes from "./item-hover-card.module.scss"
import { getItemDetailsProps } from "../../hooks/items.js"
import type { ScheduleItem } from "@open-event-systems/schedule-lib"

export type ItemHoverCardProps = HoverCardProps & {
  item?: ScheduleItem | undefined
  children?: ReactNode
  hideDetails?: boolean | undefined
  ItemDetailsProps?: Partial<ItemDetailsProps> | undefined
  classNames?:
    | {
        dropdown?: string | undefined
      }
    | undefined
  renderItemDetails?:
    ((props: ItemDetailsProps) => ReactNode) | undefined | undefined
}

export const ItemHoverCard = memo((props: ItemHoverCardProps) => {
  const defaultRenderItemDetails = (props: ItemDetailsProps) => {
    return <ItemDetails {...props} />
  }

  const {
    item,
    children,
    hideDetails,
    ItemDetailsProps,
    classNames,
    renderItemDetails,
    ...other
  } = useProps(
    "ItemHoverCard",
    { renderItemDetails: defaultRenderItemDetails },
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
        {item &&
          !hideDetails &&
          renderItemDetails({
            ...ItemDetailsProps,
            ...getItemDetailsProps(item),
          })}
      </HoverCard.Dropdown>
    </HoverCard>
  )
})

ItemHoverCard.displayName = "ItemHoverCard"
