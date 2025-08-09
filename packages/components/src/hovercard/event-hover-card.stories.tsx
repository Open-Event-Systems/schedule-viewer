import { Meta, StoryObj } from "@storybook/react-webpack5"
import { EventHoverCard } from "./event-hover-card.js"
import { Button } from "@mantine/core"

import "./event-hover-card.js"
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
