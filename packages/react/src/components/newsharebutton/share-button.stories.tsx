import type { Meta, StoryObj } from "@storybook/react-vite"
import { ShareButton } from "./share-button.js"

const meta: Meta<typeof ShareButton.Root> = {
  component: ShareButton.Root,
  argTypes: {
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: "inline-radio",
    },
  },
  args: {
    size: "md",
  },
}

export default meta

export const URL: StoryObj<typeof ShareButton.URL> = {
  args: {
    url: "#",
  },
  render(args) {
    return <ShareButton.URL {...args} />
  },
}
