import { Meta, StoryObj } from "@storybook/react-webpack5"
import { ShareButton } from "./share-button.js"

const meta: Meta<typeof ShareButton> = {
  component: ShareButton,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default: StoryObj<typeof ShareButton> = {}
