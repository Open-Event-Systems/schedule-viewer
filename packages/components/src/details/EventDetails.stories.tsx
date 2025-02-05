import { Meta, StoryObj } from "@storybook/react"
import { EventDetails } from "./EventDetails.js"
import { events } from "../test-data.js"

import "./EventDetails.scss"

const meta: Meta<typeof EventDetails> = {
  component: EventDetails,
  args: {
    event: events[1],
  },
}

export default meta

export const Default: StoryObj<typeof EventDetails> = {
  args: {
    h: 200,
  },
}
