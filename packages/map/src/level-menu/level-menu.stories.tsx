import type { Meta, StoryObj } from "@storybook/react-vite"
import { LevelMenu } from "./level-menu.js"
import { Box } from "@mantine/core"
import { useState } from "react"

const meta: Meta<typeof LevelMenu> = {
  component: LevelMenu,
}

export default meta

export const Default: StoryObj<typeof LevelMenu> = {
  args: {
    levels: [
      { id: "2f", title: "2F", url: "" },
      { id: "lobby", title: "Lobby", url: "" },
      { id: "ll", title: "Lower", url: "" },
    ],
  },
  decorators: [
    (Story) => {
      return (
        <Box w={100}>
          <Story />
        </Box>
      )
    },
  ],
  render(args) {
    const [sel, setSel] = useState("lobby")

    return <LevelMenu {...args} selectedLevel={sel} onSelectLevel={setSel} />
  },
}
