import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemDetails, type ItemDetailsButtonOption } from "./item-details.js"
import { events, tagEntries } from "../../test-data.js"
import { useCallback, useState } from "react"
import { add } from "date-fns"

const item = events[1]

const meta: Meta<typeof ItemDetails> = {
  component: ItemDetails,
  args: {
    id: "test",
    title: item.title,
    description: item.description,
    contacts: [
      ...item.contacts,
      {
        name: "Person 2",
      },
    ],
    tags: item.tags,
    h: 300,
    w: 500,
    large: true,
    buttonOptions: ["share", "bookmark", "visited"],
    tagEntries,
    getLocationProps: () => ({
      href: "#",
      onClick: (e) => e.preventDefault(),
    }),
  },
  decorators: [
    (Story, { args }) => {
      const [bookmarked, setBookmarked] = useState(false)
      const [visited, setVisited] = useState(false)

      const onSelectOption = useCallback(
        (opt: ItemDetailsButtonOption) => {
          if (opt == "visited") {
            setVisited(!visited)
          } else if (opt == "bookmark") {
            setBookmarked(!bookmarked)
          }
        },
        [bookmarked, visited],
      )

      return (
        <Story
          args={{
            ...args,
            bookmarked,
            visited,
            onSelectOption,
            bookmarkCount: bookmarked ? 18 : 17,
          }}
        />
      )
    },
  ],
}

export default meta

export const Default: StoryObj<typeof ItemDetails> = {
  args: {
    occurrences: [
      {
        start: item.start,
        end: item.end,
        location: item.location,
      },
    ],
  },
  render(args) {
    return <ItemDetails {...args} />
  },
}

export const MultiLocation: StoryObj<typeof ItemDetails> = {
  args: {
    occurrences: [
      {
        start: item.start,
        end: item.end,
        location: [...item.location, "Panel Room 2"],
      },
    ],
  },
  render(args) {
    return <ItemDetails {...args} />
  },
}

export const MultiOccurrence: StoryObj<typeof ItemDetails> = {
  args: {
    occurrences: [
      {
        start: item.start,
        end: item.end,
        location: item.location,
      },
      {
        start: add(item.start, { days: 1 }),
        end: add(item.end, { days: 1 }),
        location: [...item.location, "Panel Room 2"],
      },
    ],
  },
  render(args) {
    return <ItemDetails {...args} />
  },
}
