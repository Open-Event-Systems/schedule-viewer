import { TagsConfigContext } from "#src/tags.js"
import { testTagsConfig } from "#src/test-data-new.js"
import type { Meta, StoryObj } from "@storybook/react-vite"
import dayjs from "dayjs"
import { Pill } from "../pill/pill.js"
import { ItemPill } from "./item-pill.js"

const meta: Meta<typeof ItemPill> = {
  component: ItemPill,
  args: {
    name: "Example Event",
    description: "Example event description",
    tags: new Set(["Main Event", "Photography"]),
    href: "#",
    onClick: (e) => e.preventDefault(),
    ItemCardProps: {
      occurrences: [
        {
          startDate: dayjs("2027-01-01T12:00:00-05:00"),
          endDate: dayjs("2027-01-01T13:00:00-05:00"),
          locations: ["Panel Room 1"],
        },
      ],
      contacts: ["Person 1"],
    },
  },
  decorators: [
    (Story) => (
      <TagsConfigContext.Provider value={testTagsConfig}>
        <Pill.Box>
          <Story />
        </Pill.Box>
      </TagsConfigContext.Provider>
    ),
  ],
}

export default meta

export const Default: StoryObj<typeof ItemPill> = {}
