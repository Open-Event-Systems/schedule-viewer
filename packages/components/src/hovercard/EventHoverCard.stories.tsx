import { Meta, StoryObj } from "@storybook/react"
import { EventHoverCard } from "./EventHoverCard.js"
import { Button } from "@mantine/core"

import "./EventHoverCard.scss"
import { events } from "../test-data.js"

const meta: Meta<typeof EventHoverCard> = {
  component: EventHoverCard,
}

export default meta

export const Default: StoryObj<typeof EventHoverCard> = {
  render(args) {
    return (
      <EventHoverCard {...args} event={events[2]}>
        <Button>Open</Button>
      </EventHoverCard>
    )
  },
}
