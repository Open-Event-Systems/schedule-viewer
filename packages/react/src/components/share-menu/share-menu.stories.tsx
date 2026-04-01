import type { Meta, StoryObj } from "@storybook/react-vite"
import { ShareMenu } from "./share-menu.js"

const meta: Meta<typeof ShareMenu> = {
  component: ShareMenu,
  args: {
    enabledOptions: [],
  },
  argTypes: {
    enabledOptions: {
      options: ["export", "share", "sync"],
      control: {
        type: "check",
      },
    },
  },
}

export default meta

export const Default: StoryObj<typeof ShareMenu> = {}
