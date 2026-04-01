import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  UpdateNotificationBody,
  updateNotificationProps,
} from "./update-notification.js"
import { notifications, Notifications } from "@mantine/notifications"
import { Box, Button } from "@mantine/core"

import "@mantine/notifications/styles.css"

const meta: Meta<typeof UpdateNotificationBody> = {
  component: UpdateNotificationBody,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      return (
        <Box p="md">
          <Story />
          <Notifications />
        </Box>
      )
    },
  ],
}

export default meta

export const Default: StoryObj<typeof UpdateNotificationBody> = {
  render(args) {
    return (
      <Button
        onClick={() => {
          notifications.show({
            ...updateNotificationProps,
            message: <UpdateNotificationBody {...args} />,
            autoClose: 8000,
          })
        }}
      >
        Notify
      </Button>
    )
  },
}
