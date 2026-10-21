import { DEFAULT_THEME, MantineProvider } from "@mantine/core"
import type { Preview } from "@storybook/react-vite"

import "@mantine/core/styles.css"

import {
  makeScheduleConfig,
  ScheduleConfigProvider,
} from "#src/hooks/config.js"
import "#src/styles.scss"
import { testTagsConfig } from "#src/test-data-new.js"
import { useState } from "react"

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
      const [cfg] = useState(() =>
        makeScheduleConfig({
          tags: testTagsConfig,
        }),
      )
      return (
        <ScheduleConfigProvider value={cfg}>
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
