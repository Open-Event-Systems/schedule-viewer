import { Meta, StoryObj } from "@storybook/react-webpack5"
import { Calendar } from "./calendar.js"
import { MouseEvent, useCallback } from "react"
import { EventDetailsProvider } from "../details/context.js"

import "./calendar.scss"

const meta: Meta<typeof Calendar> = {
  component: Calendar,
}

export default meta

export const Default: StoryObj<typeof Calendar> = {
  render(args) {
    const onClickEvent = useCallback((e: MouseEvent) => e.preventDefault(), [])
    const getHref = useCallback(() => "#", [])

    return (
      <EventDetailsProvider
        value={{
          getHref,
          onClickEvent,
        }}
      >
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
                  hosts: [],
                  tags: new Set(),
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
                  hosts: [],
                  tags: new Set(),
                },
              ],
            },
          ]}
          {...args}
          start={new Date(2020, 0, 1, 9, 0)}
          end={new Date(2020, 0, 1, 17)}
        />
      </EventDetailsProvider>
    )
  },
}
