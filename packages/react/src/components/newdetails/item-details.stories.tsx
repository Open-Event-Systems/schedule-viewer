import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemDetails } from "./item-details.js"
import { Box } from "@mantine/core"
import dayjs from "dayjs"
import { useCallback, useState } from "react"

const meta: Meta<typeof ItemDetails> = {
  component: ItemDetails,
  decorators: [
    (Story) => (
      <Box maw={500}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: "radio",
    },
  },
}

export default meta

export const Default: StoryObj<typeof ItemDetails> = {
  args: {
    name: "Example Event",
    description: "An example event.\n\n**Markdown** is supported.",
    tags: ["Main Event", "Photography"],
    startDate: dayjs("2027-01-15T12:00:00-05:00"),
    endDate: dayjs("2027-01-15T13:00:00-05:00"),
    locations: [
      { name: "Panel Room 1A", href: "#", onClick: (e) => e.preventDefault() },
      { name: "Panel Room 1B", href: "#", onClick: (e) => e.preventDefault() },
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
    headerImageURL:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png",
    allowBookmark: true,
    allowVisited: true,
    small: false,
  },
  render(args) {
    const [{ isBookmarked, isVisited, bookmarkCount }, setState] = useState(
      () => ({
        isBookmarked: false,
        isVisited: false,
        bookmarkCount: 17,
      }),
    )

    const onSetBookmarked = useCallback(
      (bookmarked: boolean) => {
        setState((prev) => ({
          ...prev,
          isBookmarked: bookmarked,
          bookmarkCount: 17 + (bookmarked ? 1 : 0),
        }))
      },
      [setState],
    )

    const onSetVisited = useCallback(
      (visited: boolean) => {
        setState((prev) => ({ ...prev, isVisited: visited }))
      },
      [setState],
    )

    return (
      <ItemDetails
        {...args}
        isBookmarked={isBookmarked}
        isVisited={isVisited}
        onSetBookmarked={onSetBookmarked}
        onSetVisited={onSetVisited}
        bookmarkCount={bookmarkCount}
      />
    )
  },
}
