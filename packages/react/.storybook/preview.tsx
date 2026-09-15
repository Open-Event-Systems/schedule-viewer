import { DEFAULT_THEME, MantineProvider } from "@mantine/core"
import type { Preview } from "@storybook/react-vite"

import "@mantine/core/styles.css"

import "#src/styles.scss"

import { ScheduleConfigContext } from "../src/hooks/config.js"
import { parsedConfig } from "../src/test-data.js"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ["autodocs"],
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
