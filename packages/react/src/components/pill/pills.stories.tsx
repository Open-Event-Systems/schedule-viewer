import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pills } from "./pills.js"

const meta: Meta<typeof Pills> = {
  component: Pills,
}

export default meta

import { Anchor, Button, WithHoverCard, WithIndicator } from "./pill.stories.js"

export const Default: StoryObj<typeof meta> = {
  render() {
    return (
      <Pills title="Pills">
        <Pills.Pill {...Anchor.args} />
        <Pills.Pill {...Button.args} />
        <Pills.Pill {...WithHoverCard.args} />
        <Pills.Pill {...WithIndicator.args} />
      </Pills>
    )
  },
}
