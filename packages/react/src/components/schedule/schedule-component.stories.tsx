import type { Meta, StoryObj } from "@storybook/react-vite"
import { makeScheduleComponent } from "./schedule-component.js"
import {
  CatalogView,
  DailyAgendaView,
  FullAgendaView,
  TagsView,
} from "./binned.js"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import { getDays, type Day } from "@open-event-systems/schedule-lib"
import { useState } from "react"

export const ScheduleComponent = makeScheduleComponent({
  "daily-agenda": DailyAgendaView,
  "full-agenda": FullAgendaView,
  catalog: CatalogView,
  tags: TagsView,
})

const meta: Meta<typeof ScheduleComponent> = {
  component: ScheduleComponent,
  argTypes: {
    type: {
      control: "radio",
      options: ["Daily Agenda", "Full Agenda", "Catalog", "Tags"],
      mapping: {
        "Daily Agenda": "daily-agenda",
        "Full Agenda": "full-agenda",
        Catalog: "catalog",
        Tags: "tags",
      },
    },
  },
  args: {
    type: "daily-agenda",
    items: parsedEvents,
    tags: parsedConfig.tags,
    days: getDays(
      [...parsedEvents].filter(
        (e): e is typeof e & { readonly start: Date } => !!e.start,
      ),
    ),
  },
}

export default meta

export const Default: StoryObj<typeof ScheduleComponent> = {
  render(args) {
    const [selectedDay, setSelectedDay] = useState<Day | undefined>()

    return (
      <ScheduleComponent
        {...args}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />
    )
  },
}

export const Empty: StoryObj<typeof ScheduleComponent> = {
  args: {
    items: [],
  },
  render(args) {
    const [selectedDay, setSelectedDay] = useState<Day | undefined>()

    return (
      <ScheduleComponent
        {...args}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />
    )
  },
}
