import { Meta, StoryObj } from "@storybook/react"
import { EventPills } from "./EventPills.js"
import "./Pills.scss"
import "../hovercard/EventHoverCard.scss"
import { events } from "../test-data.js"

const meta: Meta<typeof EventPills> = {
  component: EventPills,
  args: {
    events: events,
  },
}

export default meta

export const Default: StoryObj<typeof EventPills> = {
  render(args) {
    return (
      <EventPills
        {...args}
        getHref={() => "#"}
        onClickEvent={(e) => e.preventDefault()}
      />
    )
  },
}
