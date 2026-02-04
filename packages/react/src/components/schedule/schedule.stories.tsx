import type { Meta, StoryObj } from "@storybook/react-vite"
import { Schedule } from "./schedule.js"
import { type Day } from "@open-event-systems/schedule-lib"
import { parsedEvents } from "../../test-data.js"
import { useState } from "react"

const meta: Meta<typeof Schedule> = {
  component: Schedule,
  args: {
    type: "daily-agenda",
  },
}

export default meta

export const Default: StoryObj<typeof Schedule> = {
  render(args) {
    const [selectedDay, setSelectedDay] = useState<Day | undefined>(undefined)

    return (
      <Schedule
        {...args}
        items={parsedEvents}
        filteredItems={parsedEvents}
        selectedDayKey={selectedDay?.key}
        onSelectDay={setSelectedDay}
      />
    )
  },
}
