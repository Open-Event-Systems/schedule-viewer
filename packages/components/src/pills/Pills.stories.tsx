import { Meta, StoryObj } from "@storybook/react"
import { Pills } from "./Pills.js"

import "./Pills.scss"

const meta: Meta<typeof Pills> = {
  component: Pills,
}

export default meta

export const Default: StoryObj<typeof Pills> = {
  render(args) {
    return (
      <Pills {...args}>
        <Pills.Bin title="12:00 pm">
          <Pills.Pill button>Event 1</Pills.Pill>
        </Pills.Bin>
        <Pills.Bin title="1:00 pm">
          <Pills.Pill button indicator="18+">
            Event 2
          </Pills.Pill>
          <Pills.Pill button>Event 3</Pills.Pill>
        </Pills.Bin>
        <Pills.Bin title="2:00 pm">
          <Pills.Pill button>Event 4</Pills.Pill>
        </Pills.Bin>
      </Pills>
    )
  },
}
