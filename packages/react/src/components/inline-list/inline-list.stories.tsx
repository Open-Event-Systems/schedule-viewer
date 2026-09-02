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
        <>Item 1</>
        <>Item 2</>
        <>Item 3</>
      </InlineList>
    )
  },
}
