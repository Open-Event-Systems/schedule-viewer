import { Meta, StoryObj } from "@storybook/react"
import { Pills } from "./Pills.js"

import "./Pills.scss"

const meta: Meta<typeof Pills> = {
  component: Pills,
}

export default meta

const eventMeta = {
  description: "Example event description.",
  tags: ["hobby", "photography"],
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
}

export const Default: StoryObj<typeof Pills> = {
  render(args) {
    return (
      <Pills
        {...args}
        events={[
          {
            id: "e1",
            location: "Room A",
            start: new Date(2020, 0, 1, 12),
            end: new Date(2020, 0, 1, 13),
            title: "Event A",
            ...eventMeta,
          },
          {
            id: "e2",
            location: "Room B",
            start: new Date(2020, 0, 1, 12, 30),
            end: new Date(2020, 0, 1, 13, 30),
            title: "Event B",
            ...eventMeta,
          },
          {
            id: "e3",
            location: "Room B",
            start: new Date(2020, 0, 1, 12, 45),
            end: new Date(2020, 0, 1, 13, 45),
            title: "Event C",
            ...eventMeta,
          },
          {
            id: "e4",
            location: "Room B",
            start: new Date(2020, 0, 1, 14, 0),
            end: new Date(2020, 0, 1, 15, 30),
            title: "Event D",
            ...eventMeta,
          },
        ]}
        getHref={() => "#"}
        onClickEvent={(e) => e.preventDefault()}
        getIndicator={(e) => (e.id == "e2" ? "18+" : undefined)}
      />
    )
  },
}
