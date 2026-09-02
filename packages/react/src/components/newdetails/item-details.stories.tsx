import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemDetails } from "./item-details.js"
import { Box } from "@mantine/core"
import dayjs from "dayjs"

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
      options: ["sm", "md", "lg"],
      control: {
        type: "radio",
        labels: {
          sm: "Small",
          md: "Medium",
          lg: "Large",
        },
      },
    },
  },
}

export default meta

export const Default: StoryObj<typeof ItemDetails> = {
  args: {
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
  },
  render(args) {
    return <ItemDetails {...args} />
  },
}

export const MultiOccurrences: StoryObj<typeof ItemDetails> = {
  args: {
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
  },
  render(args) {
    return <ItemDetails {...args} />
  },
}
