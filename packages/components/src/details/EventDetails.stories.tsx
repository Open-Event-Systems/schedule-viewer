import { Meta, StoryObj } from "@storybook/react"
import { EventDetails } from "./EventDetails.js"

import "./EventDetails.scss"

const meta: Meta<typeof EventDetails> = {
  component: EventDetails,
  args: {
    event: {
      id: "e1",
      title: "Example Event",
      description: "Example event description.",
      start: new Date(2020, 1, 1, 12),
      end: new Date(2020, 1, 1, 13),
      hosts: [
        { name: "Person A", url: "https://example.net" },
        { name: "Person B", url: "https://example.net" },
      ],
      location: "Room A",
      tags: ["hobby", "photography"],
    },
  },
}

export default meta

export const Default: StoryObj<typeof EventDetails> = {
  args: {
    h: 200
  }
}
