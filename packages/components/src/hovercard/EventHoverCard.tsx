import { HoverCard, HoverCardProps, useProps } from "@mantine/core"
import { Event } from "@open-event-systems/schedule-lib"
import { ReactNode } from "react"
import { EventDetails } from "../details/EventDetails.js"

export type EventHoverCardProps = HoverCardProps & {
  event: Event
  children?: ReactNode
}

export const EventHoverCard = (props: EventHoverCardProps) => {
  const { children, event, ...other } = useProps("EventHoverCard", {}, props)

  return (
    <HoverCard
      classNames={{ dropdown: "EventHoverCard-dropdown" }}
      withArrow
      {...other}
    >
      <HoverCard.Target>{children}</HoverCard.Target>
      <HoverCard.Dropdown>
        <EventDetails event={event} />
      </HoverCard.Dropdown>
    </HoverCard>
  )
}
