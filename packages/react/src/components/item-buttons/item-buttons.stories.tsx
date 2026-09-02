import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemButtons } from "./item-buttons.js"
import { useState } from "react"
import { Flex } from "@mantine/core"


const meta: Meta<typeof ItemButtons> = {
  component: ItemButtons,
  args: {
    enableFeatures: ["share", "bookmark", "visited"],
    url: "#",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    enableFeatures: {
      options: ["share", "bookmark", "visited"],
      control: {
        type: "check",
        label: {
          share: "Share",
          bookmark: "Bookmark",
          visited: "Mark visited",
        },
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      const [isBookmarked, setIsBookmarked] = useState(false)
      const [isVisited, setIsVisited] = useState(false)

      return (
        <Story
          args={{
            ...ctx.args,
            isBookmarked,
            isVisited,
            onSetBookmarked: setIsBookmarked,
            onSetVisited: setIsVisited,
            bookmarkCount: isBookmarked ? 18 : 17,
          }}
        />
      )
    },
  ],
}

export default meta

export const Default: StoryObj<typeof ItemButtons> = {}

export const Vertical: StoryObj<typeof ItemButtons> = {
  args: {
    variant: "vertical",
  },
  decorators: [
    (Story) => (
      <Flex w={200}>
        <Story />
      </Flex>
    ),
  ],
}
