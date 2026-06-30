import type { Meta, StoryObj } from "@storybook/react-vite"
import { Schedule } from "./schedule-component.js"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import { getDays, type Day } from "@open-event-systems/schedule-lib"
import { useState, type ComponentPropsWithoutRef } from "react"
import type { Dayjs } from "dayjs"

const meta: Meta<typeof Schedule> = {
  component: Schedule,
  argTypes: {
    type: {
      control: "radio",
      options: ["Daily Agenda", "Full Agenda", "Catalog", "Tags", "Gantt"],
      mapping: {
        "Daily Agenda": "daily-agenda",
        "Full Agenda": "full-agenda",
        Catalog: "catalog",
        Tags: "tags",
        Gantt: "gantt",
      },
    },
  },
  args: {
    type: "daily-agenda" as ComponentPropsWithoutRef<typeof Schedule>["type"],
    items: parsedEvents,
    days: getDays(
      [...parsedEvents].filter(
        (e): e is typeof e & { readonly start: Dayjs } => !!e.startDate,
      ),
    ),
    tags: parsedConfig.tags,
    tagIndicators: parsedConfig.tagIndicators,
    locations: ["Main Ballroom", "Panel Room 1", "Panel Room 2"],
  },
  decorators: [
    (Story, { args }) => {
      const [selectedDay, setSelectedDay] = useState<Day | undefined>(undefined)

      const updatedArgs = {
        ...args,
        selectedDay: selectedDay,
        onSelectDay: setSelectedDay,
      }

      return <Story args={updatedArgs} />
    },
  ],
}

export default meta

export const Default: StoryObj<typeof Schedule> = {
  render(args) {
    return <Schedule {...args} />
  },
}

export const Empty: StoryObj<typeof Schedule> = {
  args: {
    items: [],
  },
  render(args) {
    return <Schedule {...args} />
  },
}
