import type { Meta, StoryObj } from "@storybook/react-vite"
import { ByDayView } from "./by-day.js"
import dayjs from "dayjs"
import { useState } from "react"

const meta: Meta<typeof ByDayView> = {
  component: ByDayView,
}

export default meta

export const Default: StoryObj<typeof ByDayView> = {
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
      <ByDayView
        {...args}
        selectedDay={selectedDay}
        onSelectDay={(d) => setSelectedDay(d.key)}
      >
        Content
      </ByDayView>
    )
  },
}
