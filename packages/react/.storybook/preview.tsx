import type { Preview } from "@storybook/react-vite"
import { DEFAULT_THEME, MantineProvider } from "@mantine/core"

import "@mantine/core/styles.css"
import "../src/styles.scss"

import { parsedConfig } from "../src/test-data.js"
import { ScheduleConfigContext } from "../src/hooks/config.js"

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
        <ScheduleConfigContext value={parsedConfig}>
          <Story />
        </ScheduleConfigContext>
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
