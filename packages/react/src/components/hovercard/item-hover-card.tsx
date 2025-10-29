import { HoverCard, type HoverCardProps, useProps } from "@mantine/core"
import type { ReactNode } from "react"
import { ItemDetails, type ItemDetailsProps } from "../details/item-details.js"
import type { ScheduleItem } from "@open-event-systems/schedule-lib"

export type ItemHoverCardProps = HoverCardProps & {
  item: ScheduleItem
  children?: ReactNode
  ItemDetailsProps?: Partial<ItemDetailsProps>
}

export const ItemHoverCard = (props: ItemHoverCardProps) => {
  const { item, children, ItemDetailsProps, ...other } = useProps(
    "ItemHoverCard",
    {},
    props,
  )

  return (
    <HoverCard
      classNames={{ dropdown: "ItemHoverCard-dropdown" }}
      position="top"
      withArrow
      {...other}
    >
      <HoverCard.Target>{children}</HoverCard.Target>
      <HoverCard.Dropdown>
        <ItemDetails {...ItemDetailsProps} item={item} />
      </HoverCard.Dropdown>
    </HoverCard>
  )
}
