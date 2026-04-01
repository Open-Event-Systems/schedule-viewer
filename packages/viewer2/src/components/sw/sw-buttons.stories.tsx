import type { Meta, StoryObj } from "@storybook/react-vite"
import { Stack } from "@mantine/core"
import { SWButtons } from "./sw-buttons.js"

const meta: Meta<typeof SWButtons> = {
  component: SWButtons,
  argTypes: {
    swStatus: {
      control: "radio",
      options: ["unavailable", "installing", "ready", "update-available"],
    },
    pwaStatus: {
      control: "radio",
      options: ["unavailable", "available", "prompted", "install-finished"],
    },
  },
}

export default meta

export const Default: StoryObj<typeof SWButtons> = {
  args: {
    swStatus: "installing",
    pwaStatus: "unavailable",
    size: "md",
  },
  decorators: [
    (Story) => (
      <Stack gap="xs">
        <Story />
      </Stack>
    ),
  ],
}
