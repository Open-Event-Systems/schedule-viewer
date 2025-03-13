import { HoverCard, HoverCardProps, useProps } from "@mantine/core"
import { Event } from "@open-event-systems/schedule-lib"
import { ReactNode } from "react"
import { EventDetails } from "../details/EventDetails.js"

export type EventHoverCardProps = HoverCardProps & {
  event: Event
  bookmarked?: boolean
  setBookmarked?: (set: boolean) => void
  bookmarkCount?: number | null
  children?: ReactNode
}

export const EventHoverCard = (props: EventHoverCardProps) => {
  const {
    children,
    event,
    bookmarked,
    setBookmarked,
    bookmarkCount,
    ...other
  } = useProps("EventHoverCard", {}, props)

  return (
    <HoverCard
      classNames={{ dropdown: "EventHoverCard-dropdown" }}
      position="top"
      withArrow
      {...other}
    >
      <HoverCard.Target>{children}</HoverCard.Target>
      <HoverCard.Dropdown>
        <EventDetails
          event={event}
          bookmarked={bookmarked}
          setBookmarked={setBookmarked}
          bookmarkCount={bookmarkCount}
        />
      </HoverCard.Dropdown>
    </HoverCard>
  )
}
