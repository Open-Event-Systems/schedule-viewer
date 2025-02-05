import type { Preview } from "@storybook/react"
import React from "react"
import "@mantine/core/styles.css"
import { MantineProvider, DEFAULT_THEME } from "@mantine/core"

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
        <MantineProvider theme={DEFAULT_THEME}>
          <Story />
        </MantineProvider>
      )
    },
  ],
}

export default preview
