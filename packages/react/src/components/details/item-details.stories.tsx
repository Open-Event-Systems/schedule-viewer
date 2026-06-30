import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemDetails, type ItemDetailsButtonOption } from "./item-details.js"
import { events, tagConfigEntries } from "../../test-data.js"
import { useCallback, useState } from "react"
import type { Address, Place } from "@open-event-systems/schedule-lib"

const item = events[1]

const meta: Meta<typeof ItemDetails> = {
  component: ItemDetails,
  args: {
    id: "test",
    name: item.name,
    description: item.description,
    performer: [
      ...item.performer,
      {
        type: "Person",
        name: "Person 2",
      },
    ],
    keywords: item.keywords,
    h: 300,
    w: 500,
    large: true,
    buttonOptions: ["share", "bookmark", "visited"],
    tagEntries: tagConfigEntries,
    getLocationProps: (loc: string | Place | Address) => {
      let children

      if (typeof loc == "string") {
        children = loc
      }

      return {
        href: "#",
        onClick: (e) => e.preventDefault(),
        children,
      }
    },
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
        startDate: item.startDate,
        endDate: item.endDate,
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
        startDate: item.startDate,
        endDate: item.endDate,
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
        startDate: item.startDate,
        endDate: item.endDate,
        location: item.location,
      },
      {
        startDate: item.startDate.add(1, "day"),
        endDate: item.endDate.add(1, "day"),
        location: [...item.location, "Panel Room 2"],
      },
    ],
  },
  render(args) {
    return <ItemDetails {...args} />
  },
}
