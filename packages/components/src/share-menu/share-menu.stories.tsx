import { Meta, StoryObj } from "@storybook/react-webpack5"
import { ShareMenu } from "./share-menu.js"

const meta: Meta<typeof ShareMenu> = {
  component: ShareMenu,
}

export default meta

export const Default: StoryObj<typeof ShareMenu> = {
  args: {
    enableSync: true,
  },
}
