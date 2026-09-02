import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemCard } from "./item-card.js"
import dayjs from "dayjs"
import { Box, Button } from "@mantine/core"
import { useState } from "react"
import { LazyHoverCard } from "../lazy-hover-card/lazy-hover-card.js"

const meta: Meta<typeof ItemCard> = {
  component: ItemCard,
  decorators: [
    (Story, ctx) => {
      const [{ isBookmarked, isVisited }, setState] = useState(() => ({
        isBookmarked: false,
        isVisited: false,
      }))

      return (
        <Box>
          <Story
            args={{
              ...ctx.args,
              isBookmarked,
              isVisited,
              bookmarkCount: isBookmarked ? 18 : 17,
              onSetBookmarked: (isBookmarked) =>
                setState((prev) => ({ ...prev, isBookmarked })),
              onSetVisited: (isVisited) =>
                setState((prev) => ({ ...prev, isVisited })),
            }}
          />
        </Box>
      )
    },
    (Story, ctx) => (
      <Box maw={ctx.args.size == "sm" ? 400 : 600}>
        <Story />
      </Box>
    ),
  ],
  args: {
    name: "Example Event",
    children: "Example event\n\nwith **Markdown** support.",
    tags: ["Main Event", "Photography"],
    bookmarkCount: 17,
    occurrences: [
      {
        startDate: dayjs("2027-01-15T12:00:00-05:00"),
        endDate: dayjs("2027-01-15T13:00:00-05:00"),
        locations: [
          {
            name: "Panel Room 1A",
            href: "#",
            onClick: (e) => e.preventDefault(),
          },
          {
            name: "Panel Room 1B",
            href: "#",
            onClick: (e) => e.preventDefault(),
          },
        ],
      },
    ],
    contacts: [
      {
        name: "Example Person 1",
        iconURL:
          "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png",
        href: "#",
        onClick: (e) => e.preventDefault(),
      },
      {
        name: "Example Person 2",
        href: "#",
        onClick: (e) => e.preventDefault(),
      },
    ],
    enableFeatures: ["bookmark", "share", "visited"],
    shareURL: "#",
    withBorder: true,
  },
  argTypes: {
    size: {
      options: ["sm", "md"],
      control: {
        type: "radio",
        labels: {
          sm: "Small",
          md: "Medium",
        },
      },
    },
    enableFeatures: {
      options: ["share", "bookmark", "visited"],
      control: {
        type: "check",
        labels: {
          share: "Share",
          bookmark: "Bookmark",
          visited: "Visited",
        },
      },
    },
  },
}

export default meta

export const Default: StoryObj<typeof ItemCard> = {}

export const WithHeader: StoryObj<typeof ItemCard> = {
  args: {
    headerImageURL:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png",
  },
}

export const MaxHeight: StoryObj<typeof ItemCard> = {
  args: {
    headerImageURL:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png",
    children:
      "Very long description\n\nVery long description\n\nVery long description\n\nVery long description\n\nVery long description",
    mah: 400,
  },
}

export const Modal: StoryObj<typeof ItemCard> = {
  parameters: {
    layout: "fullscreen",
  },
  args: {
    headerImageURL:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png",
    withBorder: false,
  },
  render(args) {
    return <ItemCard.Modal onClose={() => {}} opened {...args} />
  },
}

export const HoverCard: StoryObj<typeof ItemCard> = {
  args: {
    headerImageURL:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png",
    withBorder: false,
  },
  render(args) {
    return (
      <LazyHoverCard target={<Button>Hover</Button>} DropdownProps={{ p: 0 }}>
        <ItemCard {...args} />
      </LazyHoverCard>
    )
  },
}
