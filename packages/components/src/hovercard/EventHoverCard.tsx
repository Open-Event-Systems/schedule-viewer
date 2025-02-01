import { HoverCard, HoverCardProps, Text, Title, useProps } from "@mantine/core"
import { Event } from "@open-event-systems/schedule-lib"
import { format } from "date-fns"
import { ReactNode } from "react"

export type EventHoverCardProps = HoverCardProps & {
  event: Event
  children?: ReactNode
}

export const EventHoverCard = (props: EventHoverCardProps) => {
  const { children, event, ...other } = useProps("EventHoverCard", {}, props)

  let startEl: ReactNode
  let locationEl: ReactNode

  if (event.start && event.end) {
    startEl = (
      <Text className="EventHoverCard-date" size="sm" c="gray">
        {format(event.start, "EEE h:mm aaa")} &ndash;{" "}
        {format(event.end, "h:mm aaa")}
      </Text>
    )
  }

  if (event.location) {
    locationEl = (
      <Text className="EventHoverCard-location" size="sm" c="gray">
        {event.location}
      </Text>
    )
  }

  return (
    <HoverCard withArrow {...other}>
      <HoverCard.Target>{children}</HoverCard.Target>
      <HoverCard.Dropdown>
        <Title order={6}>{event.title}</Title>
        {startEl}
        {locationEl}
        <Text component="p">{event.description}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}
