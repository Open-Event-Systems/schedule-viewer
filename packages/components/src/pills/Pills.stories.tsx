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
      <Pills
        {...args}
        events={[
          {
            id: "e1",
            location: "Room A",
            start: new Date(2020, 0, 1, 12),
            end: new Date(2020, 0, 1, 13),
            title: "Event A",
            description: "",
          },
          {
            id: "e2",
            location: "Room B",
            start: new Date(2020, 0, 1, 12, 30),
            end: new Date(2020, 0, 1, 13, 30),
            title: "Event B",
            description: "",
          },
          {
            id: "e3",
            location: "Room B",
            start: new Date(2020, 0, 1, 12, 45),
            end: new Date(2020, 0, 1, 13, 45),
            title: "Event C",
            description: "",
          },
        ]}
        getHref={() => "#"}
        onClickEvent={(e) => e.preventDefault()}
        getIndicator={(e) => (e.id == "e2" ? "18+" : undefined)}
      />
    )
  },
}
