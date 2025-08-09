import { Meta, StoryObj } from "@storybook/react-webpack5"
import { ConfirmSyncDialog } from "./confirm-sync-dialog.js"

const meta: Meta<typeof ConfirmSyncDialog> = {
  component: ConfirmSyncDialog,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryObj<typeof ConfirmSyncDialog> = {
  args: {
    opened: true,
  },
}
