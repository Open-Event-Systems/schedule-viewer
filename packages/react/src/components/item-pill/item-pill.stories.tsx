import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemPill } from "./item-pill.js"
import dayjs from "dayjs"
import { Pill } from "../newpill/pill.js"
import { makeDefaultGetTagViewPropsFunc } from "../../hooks/newitems.js"

const meta: Meta<typeof ItemPill> = {
  component: ItemPill,
  args: {
    href: "#",
    onClick: (e) => e.preventDefault(),
    name: "Example Event",
    tags: ["main-event", "photography"],
    ItemCardProps: {
      name: "Example Event",
      description: "Example event description",
      tags: ["Main Event", "Photography"],
      occurrences: [
        {
          startDate: dayjs("2027-01-01T12:00:00-05:00"),
          endDate: dayjs("2027-01-01T13:00:00-05:00"),
          locations: ["Panel Room 1"],
        },
      ],
      contacts: ["Person 1"],
    },
    getTagViewProps: makeDefaultGetTagViewPropsFunc((tag) => {
      switch (tag) {
        case "main-event":
          return {
            before: "⭐",
            color: "#006915",
            textColor: "#ffffff",
          }
        case "photography":
          return {
            before: "📷",
            color: "#480044",
            textColor: "#ffffff",
          }
      }
    }),
  },
  decorators: [
    (Story) => (
      <Pill.Box>
        <Story />
      </Pill.Box>
    ),
  ],
}

export default meta

export const Default: StoryObj<typeof ItemPill> = {}
