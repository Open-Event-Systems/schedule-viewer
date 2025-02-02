import { Meta, StoryObj } from "@storybook/react"
import { DayFilter } from "./DayFilter.js"
import { Event } from "@open-event-systems/schedule-lib"
import { useState } from "react"

import "./DayFilter.scss"

const meta: Meta<typeof DayFilter> = {
  component: DayFilter,
  args: {
    events: [
      {
        id: "e1",
        location: "Room A",
        start: new Date(2020, 0, 1, 12),
        end: new Date(2020, 0, 1, 13),
        title: "Event A",
      },
      {
        id: "e2",
        location: "Room B",
        start: new Date(2020, 0, 1, 12, 30),
        end: new Date(2020, 0, 1, 13, 30),
        title: "Event B",
      },
      {
        id: "e3",
        location: "Room B",
        start: new Date(2020, 0, 2, 12, 45),
        end: new Date(2020, 0, 2, 13, 45),
        title: "Event C",
      },
      {
        id: "e4",
        location: "Room B",
        start: new Date(2020, 0, 3, 14, 0),
        end: new Date(2020, 0, 3, 15, 30),
        title: "Event D",
      },
    ] as Event[],
  },
}

export default meta

export const Default: StoryObj<typeof DayFilter> = {
  render(args) {
    const [selectedDay, setSelectedDay] = useState("")
    return (
      <DayFilter
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        {...args}
      />
    )
  },
}
