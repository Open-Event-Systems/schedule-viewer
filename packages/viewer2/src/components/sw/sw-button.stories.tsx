import type { Meta, StoryObj } from "@storybook/react-vite"
import { SWButton } from "./sw-button.js"
import { Stack } from "@mantine/core"

const meta: Meta<typeof SWButton> = {
  component: SWButton,
}

export default meta

export const Default: StoryObj<typeof SWButton> = {
  args: {
    swInstalling: false,
    swReady: true,
    pwaInstallAvailable: false,
    pwaInstalling: false,
    updateAvailable: false,
    size: "md",
  },
  render(args) {
    return <SWButton {...args} />
  },
  decorators: [
    (Story) => (
      <Stack gap="xs">
        <Story />
      </Stack>
    ),
  ],
}
