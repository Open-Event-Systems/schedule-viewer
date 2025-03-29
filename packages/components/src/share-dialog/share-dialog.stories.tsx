import { Meta, StoryObj } from "@storybook/react"
import { ShareDialog } from "./share-dialog.js"

const meta: Meta<typeof ShareDialog> = {
  component: ShareDialog,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const Share: StoryObj<typeof ShareDialog> = {
  args: {
    opened: true,
    shareURL: "https://example.net",
    type: "share",
  },
}

export const Sync: StoryObj<typeof ShareDialog> = {
  args: {
    opened: true,
    shareURL: "https://example.net",
    type: "sync",
  },
}
