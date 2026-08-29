import type { Meta, StoryObj } from "@storybook/react-vite"
import { LazyHoverCard } from "./lazy-hover-card.js"
import { Button } from "@mantine/core"

const meta: Meta<typeof LazyHoverCard> = {
  component: LazyHoverCard,
}

export default meta

export const Default: StoryObj<typeof LazyHoverCard> = {
  render(args) {
    return (
      <LazyHoverCard {...args} target={<Button>Target</Button>}>
        Content
      </LazyHoverCard>
    )
  },
}
