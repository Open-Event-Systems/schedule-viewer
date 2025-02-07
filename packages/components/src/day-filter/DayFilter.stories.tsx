import { Meta, StoryObj } from "@storybook/react"
import { DayFilter } from "./DayFilter.js"
import { useState } from "react"

import "./DayFilter.scss"

const meta: Meta<typeof DayFilter> = {
  component: DayFilter,
}

export default meta

export const Default: StoryObj<typeof DayFilter> = {
  args: {
    days: [
      {
        key: "2025-01-01",
        start: new Date(2025, 0, 1, 6),
        end: new Date(2025, 0, 2, 6),
      },
      {
        key: "2025-01-02",
        start: new Date(2025, 0, 2, 6),
        end: new Date(2025, 0, 3, 6),
      },
      {
        key: "2025-01-03",
        start: new Date(2025, 0, 3, 6),
        end: new Date(2025, 0, 4, 6),
      },
    ],
  },
  render(args) {
    const [selectedDay, setSelectedDay] = useState("2025-01-01")
    return (
      <DayFilter
        selectedDay={selectedDay}
        onSelectDay={(d) => setSelectedDay(d.key)}
        {...args}
      />
    )
  },
}
