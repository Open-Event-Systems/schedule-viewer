import { Meta, StoryObj } from "@storybook/react"
import { EventHoverCard } from "./EventHoverCard.js"
import { Button } from "@mantine/core"

import "./EventHoverCard.scss"

const meta: Meta<typeof EventHoverCard> = {
  component: EventHoverCard,
}

export default meta

export const Default: StoryObj<typeof EventHoverCard> = {
  render(args) {
    return (
      <EventHoverCard
        {...args}
        event={{
          id: "e1",
          start: new Date(2020, 1, 1, 12),
          end: new Date(2020, 1, 1, 13, 30),
          location: "Room A",
          title: "Event A",
          description: "An example event.",
          hosts: [
            {
              name: "Test Person 1",
              url: "https://example.net",
            },
            {
              name: "Test Person 2",
              url: "https://example.net",
            },
          ],
        }}
      >
        <Button>Open</Button>
      </EventHoverCard>
    )
  },
}
