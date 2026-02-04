import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemPill } from "./item-pill.js"
import { Pill } from "./pill.js"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import type { ScheduleEvent } from "@open-event-systems/schedule-lib"

const meta: Meta<typeof ItemPill> = {
  component: ItemPill,
}

export default meta

const event = parsedEvents.get("opening-ceremonies") as ScheduleEvent

export const Default: StoryObj<typeof ItemPill> = {
  args: {
    item: { ...event },
    ItemHoverCardProps: {
      ItemDetailsProps: {
        tags: [{ tag: "example", title: "Example" }],
      },
    },
  },
  render(args) {
    return (
      <Pill.Bin>
        <ItemPill tags={parsedConfig.tags} {...args} />
      </Pill.Bin>
    )
  },
}

export const ItemPillBin: StoryObj<typeof ItemPill> = {
  render() {
    return (
      <ItemPill.Bin
        title="Item Pill Bin"
        items={parsedEvents}
        tags={parsedConfig.tags}
        tagIndicators={parsedConfig.tagIndicators}
      />
    )
  },
}
