import { Meta, StoryObj } from "@storybook/react"
import { EventDetails } from "./EventDetails.js"
import { events } from "../test-data.js"

import "./EventDetails.scss"
import { useState } from "react"

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
    w: 400,
  },
  render(args) {
    const [bookmarked, setBookmarked] = useState(false)

    return (
      <EventDetails
        {...args}
        bookmarked={bookmarked}
        setBookmarked={setBookmarked}
      />
    )
  },
}
