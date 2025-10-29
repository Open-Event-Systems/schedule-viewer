import type { Preview } from "@storybook/react-vite"
import { MantineProvider, DEFAULT_THEME } from "@mantine/core"
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
        <MantineProvider theme={DEFAULT_THEME}>
          <Story />
        </MantineProvider>
      )
    },
  ],
}

export default preview
