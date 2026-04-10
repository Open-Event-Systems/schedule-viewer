import type { Meta, StoryObj } from "@storybook/react-vite"
import { Bins } from "./bins.js"
import { Box, List, Title } from "@mantine/core"
import { iterToArr } from "@open-event-systems/schedule-lib"

const meta: Meta<typeof Bins> = {
  component: Bins,
  subcomponents: { Root: Bins.Root, Title: Bins.Title, Bin: Bins.Bin },
}

export default meta

export const Default: StoryObj<typeof Bins<string>> = {
  args: {
    title: "Bins Title",
    bins: [
      {
        key: "1",
        title: "Bin 1",
        items: ["A", "B", "C"],
      },
      {
        key: "2",
        title: "Bin 2",
        items: ["D", "E", "F"],
      },
    ],
    renderTitle: (props) => <Title {...props} style={{}} order={3} />,
    renderBin: (props, bin) => {
      return (
        <Box {...props}>
          <Title order={4}>{bin.title}</Title>
          <List>
            {iterToArr(bin.items).map((i) => (
              <List.Item key={i}>{i}</List.Item>
            ))}
          </List>
        </Box>
      )
    },
  },
}
