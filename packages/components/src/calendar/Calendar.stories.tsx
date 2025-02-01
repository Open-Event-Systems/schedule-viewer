import { Meta, StoryObj } from "@storybook/react"
import { Calendar } from "./Calendar.js"

import "./Calendar.scss"

const meta: Meta<typeof Calendar> = {
  component: Calendar,
}

export default meta

export const Default: StoryObj<typeof Calendar> = {
  render(args) {
    return (
      <Calendar
        columns={[
          {
            title: "Room A",
            events: [
              {
                id: "e1",
                location: "Room A",
                start: new Date(2020, 0, 1, 12),
                end: new Date(2020, 0, 1, 13),
                title: "Event A",
                description: "",
              },
            ],
          },
          {
            title: "Room B",
            events: [
              {
                id: "e2",
                location: "Room B",
                start: new Date(2020, 0, 1, 12, 30),
                end: new Date(2020, 0, 1, 13, 30),
                title: "Event B",
                description: "",
              },
            ],
          },
        ]}
        {...args}
        start={new Date(2020, 0, 1, 9, 0)}
        end={new Date(2020, 0, 1, 17)}
        getHref={() => "#"}
        onClickEvent={(e) => e.preventDefault()}
      />
    )
  },
}
