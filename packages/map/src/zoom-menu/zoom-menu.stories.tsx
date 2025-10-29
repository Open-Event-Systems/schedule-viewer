import type { Meta, StoryObj } from "@storybook/react-vite"
import { ZoomMenu } from "./zoom-menu.js"

const meta: Meta<typeof ZoomMenu> = {
  component: ZoomMenu,
  args: {
    homeURL: "#",
  },
}

export default meta

export const Default: StoryObj<typeof ZoomMenu> = {}
