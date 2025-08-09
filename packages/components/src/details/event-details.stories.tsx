import { Meta, StoryObj } from "@storybook/react-webpack5"
import { EventDetails } from "./event-details.js"
import { events } from "../test-data.js"
import { useState } from "react"

import "../icon-text/icon-text.scss"
import "./event-details.scss"

const meta: Meta<typeof EventDetails> = {
  component: EventDetails,
  args: {
    event: events[1],
    showShare: true,
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
        bookmarkCount={bookmarked ? 18 : 17}
      />
    )
  },
}
