import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemHoverCard } from "./item-hover-card.js"
import { Button } from "@mantine/core"

import { events, tagConfigEntries } from "../../test-data.js"

const meta: Meta<typeof ItemHoverCard> = {
  component: ItemHoverCard,
}

export default meta

export const Default: StoryObj<typeof ItemHoverCard> = {
  render(args) {
    return (
      <ItemHoverCard
        {...args}
        item={events[2]}
        ItemDetailsProps={{ tagEntries: tagConfigEntries }}
      >
        <Button>Open</Button>
      </ItemHoverCard>
    )
  },
}
