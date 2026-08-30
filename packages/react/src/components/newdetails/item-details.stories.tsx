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
      options: ["sm", "lg"],
      control: {
        type: "radio",
        labels: {
          sm: "Small",
          lg: "Large",
        },
      },
    },
  },
}

export default meta

export const Default: StoryObj<typeof ItemDetails> = {
  args: {
    name: "Example Event",
    description: "An example event.\n\n**Markdown** is supported.",
    tags: ["Main Event", "Photography"],
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
    headerImageURL:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png",
    allowBookmark: true,
    allowVisited: true,
    allowShare: true,
    url: "#",
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

export const MultiOccurrences: StoryObj<typeof ItemDetails> = {
  args: {
    name: "Example Event",
    description: "An example event.\n\n**Markdown** is supported.",
    tags: ["Main Event", "Photography"],
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
      {
        startDate: dayjs("2027-01-15T14:00:00-05:00"),
        endDate: dayjs("2027-01-15T15:00:00-05:00"),
        locations: [
          {
            name: "Panel Room 2",
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
    headerImageURL:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png",
    allowBookmark: true,
    allowVisited: true,
    allowShare: true,
    url: "#",
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

export const Large: StoryObj<typeof ItemDetails> = {
  args: {
    name: "Example Event",
    description:
      "An example event.\n\n**Markdown** is supported.\n\nMany lines\n\nMany lines\n\nMany lines\n\nMany lines",
    tags: ["Main Event", "Photography"],
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
      {
        startDate: dayjs("2027-01-15T14:00:00-05:00"),
        endDate: dayjs("2027-01-15T15:00:00-05:00"),
        locations: [
          {
            name: "Panel Room 2",
            href: "#",
            onClick: (e) => e.preventDefault(),
          },
        ],
      },
      {
        startDate: dayjs("2027-01-15T16:00:00-05:00"),
        endDate: dayjs("2027-01-15T17:00:00-05:00"),
        locations: [
          {
            name: "Panel Room 2",
            href: "#",
            onClick: (e) => e.preventDefault(),
          },
        ],
      },
      {
        startDate: dayjs("2027-01-15T18:00:00-05:00"),
        endDate: dayjs("2027-01-15T19:00:00-05:00"),
        locations: [
          {
            name: "Panel Room 2",
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
    headerImageURL:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png",
    allowBookmark: true,
    allowVisited: true,
    allowShare: true,
    url: "#",
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
        mah={300}
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
