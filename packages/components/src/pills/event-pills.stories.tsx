import { Meta, StoryObj } from "@storybook/react-webpack5"
import { EventPills } from "./event-pills.js"
import { events } from "../test-data.js"

import "./pills.scss"
import "../hovercard/event-hover-card.scss"

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
