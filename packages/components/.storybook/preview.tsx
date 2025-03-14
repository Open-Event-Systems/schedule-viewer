import type { Preview } from "@storybook/react"
import { DEFAULT_THEME, MantineProvider } from "@mantine/core"
import React from "react"

import { ScheduleConfigProvider } from "../src/config/context.js"
import { config } from "../src/test-data.js"

import "@mantine/core/styles.css"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <ScheduleConfigProvider value={config}>
          <Story />
        </ScheduleConfigProvider>
      )
    },
    (Story) => {
      return (
        <MantineProvider theme={DEFAULT_THEME}>
          <Story />
        </MantineProvider>
      )
    },
  ],
}

export default preview
