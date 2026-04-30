import type { Meta, StoryObj } from "@storybook/react-vite"
import { PageMenu } from "./page-menu.js"
import { useState } from "react"

const meta: Meta<typeof PageMenu> = {
  component: PageMenu,
  args: {
    pages: [
      {
        id: "page1",
        title: "Page 1",
        description: "Example page 1.",
        views: [
          {
            id: "default",
            title: "Default",
            type: "daily-agenda",
          },
        ],
      },
      {
        id: "page2",
        title: "Page 2",
        description: "Example page 2.",
        views: [
          {
            id: "default",
            title: "Default",
            type: "daily-agenda",
          },
        ],
      },
      {
        id: "page3",
        title: "Page 3",
        description: "Example page 3.",
        views: [
          {
            id: "default",
            title: "Default",
            type: "daily-agenda",
          },
        ],
      },
    ],
  },
}

export default meta

export const Default: StoryObj<typeof PageMenu> = {
  args: {
    variant: "tabs",
  },
  render(args) {
    const [selectedPage, setSelectedPage] = useState<string | undefined>()

    return (
      <PageMenu
        {...args}
        selectedPage={selectedPage}
        onSelectPage={setSelectedPage}
        renderPage={(cfg) => <>Content for {cfg.title}</>}
      />
    )
  },
}
