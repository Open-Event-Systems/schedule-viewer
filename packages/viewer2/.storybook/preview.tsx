import type { Preview } from "@storybook/react-vite"
import { MantineProvider } from "@mantine/core"

import "@mantine/core/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <MantineProvider forceColorScheme="dark">
          <Story />
        </MantineProvider>
      )
    },
  ],
}

export default preview
