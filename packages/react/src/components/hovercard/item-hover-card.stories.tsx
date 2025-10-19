import { Meta, StoryObj } from "@storybook/react-webpack5"
import { ItemHoverCard } from "./item-hover-card.js"
import { Button } from "@mantine/core"

import "./item-hover-card.js"
import { events, tagEntries } from "../../test-data.js"

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
        ItemDetailsProps={{ tags: tagEntries }}
      >
        <Button>Open</Button>
      </ItemHoverCard>
    )
  },
}
