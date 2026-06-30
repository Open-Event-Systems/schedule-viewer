import type { Meta, StoryObj } from "@storybook/react-vite"
import { DayFilter } from "./day-filter.js"
import { useState } from "react"
import dayjs from "dayjs"

const meta: Meta<typeof DayFilter> = {
  component: DayFilter,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default: StoryObj<typeof DayFilter> = {
  args: {
    days: [
      {
        key: "2025-01-01",
        startDate: dayjs(new Date(2025, 0, 1, 6)),
        endDate: dayjs(new Date(2025, 0, 2, 6)),
      },
      {
        key: "2025-01-02",
        startDate: dayjs(new Date(2025, 0, 2, 6)),
        endDate: dayjs(new Date(2025, 0, 3, 6)),
      },
      {
        key: "2025-01-03",
        startDate: dayjs(new Date(2025, 0, 3, 6)),
        endDate: dayjs(new Date(2025, 0, 4, 6)),
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
