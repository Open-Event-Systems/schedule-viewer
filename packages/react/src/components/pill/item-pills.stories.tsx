import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemPills } from "./item-pills.js"
import { parsedConfig, parsedEvents } from "../../test-data.js"

const meta: Meta<typeof ItemPills> = {
  component: ItemPills,
}

export default meta

export const Default: StoryObj<typeof meta> = {
  render() {
    return (
      <ItemPills
        title="Item Pill Bin"
        items={parsedEvents}
        tags={parsedConfig.tags}
        tagIndicators={parsedConfig.tagIndicators}
      />
    )
  },
}
