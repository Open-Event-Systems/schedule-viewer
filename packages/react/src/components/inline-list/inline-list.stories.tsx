import type { Meta, StoryObj } from "@storybook/react-vite"
import { InlineList } from "./inline-list.js"

const meta: Meta<typeof InlineList> = {
  component: InlineList,
}

export default meta

export const Default: StoryObj<typeof InlineList> = {
  render(args) {
    return (
      <InlineList {...args}>
        <InlineList.Item>Item 1</InlineList.Item>
        <InlineList.Item>Item 2</InlineList.Item>
        <InlineList.Item>Item 3</InlineList.Item>
      </InlineList>
    )
  },
}
