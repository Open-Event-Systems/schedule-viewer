import type { Preview } from "@storybook/react-vite"
import { DEFAULT_THEME, MantineProvider } from "@mantine/core"

import "@mantine/core/styles.css"
import {
  DEFAULT_SCHEDULE_CONFIG,
  ScheduleConfigProvider,
} from "../src/config/config.js"

import { config } from "../src/test-data.js"

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
        <ScheduleConfigProvider
          value={{ ...DEFAULT_SCHEDULE_CONFIG, ...config }}
        >
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
