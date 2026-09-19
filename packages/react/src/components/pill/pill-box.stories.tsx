import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pill } from "./pill.js"

import * as PillStories from "./pill.stories.js"

const meta: Meta<typeof Pill.Box> = {
  component: Pill.Box,
  args: {
    maw: "400px",
  },
}

export default meta

export const Default: StoryObj<typeof Pill.Box> = {
  render(args) {
    return (
      <Pill.Box {...args}>
        <Pill {...PillStories.Default.args} />
        <Pill {...PillStories.WithIndicator.args} />
        <Pill {...PillStories.WithBeforeAndAfter.args} />
        <Pill {...PillStories.AsLink.args} />
        <Pill {...PillStories.AsButton.args} />
        <Pill {...PillStories.WithColor.args} />
        <Pill {...PillStories.Highlighted.args} />
        <Pill {...PillStories.Disabled.args} />
        <Pill {...PillStories.WithMultiColors.args} />
      </Pill.Box>
    )
  },
}
