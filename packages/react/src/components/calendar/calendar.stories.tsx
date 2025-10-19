import { Meta, StoryObj } from "@storybook/react-webpack5"
import { Calendar } from "./calendar.js"
import { MouseEvent, useCallback } from "react"
import { ItemDetailsProvider, makeItemDetailsFunc } from "../details/context.js"

import "../details/item-details.scss"
import "./calendar.scss"

const meta: Meta<typeof Calendar> = {
  component: Calendar,
}

export default meta

export const Default: StoryObj<typeof Calendar> = {
  render(args) {
    const onClickItem = useCallback((e: MouseEvent) => e.preventDefault(), [])
    const getHref = useCallback(() => "#", [])

    return (
      <ItemDetailsProvider
        value={makeItemDetailsFunc({
          getHref,
          onClickItem,
        })}
      >
        <Calendar
          columns={[
            {
              title: "Room A",
              items: [
                {
                  id: "e1",
                  type: "event",
                  location: "Room A",
                  start: new Date(2020, 0, 1, 12),
                  end: new Date(2020, 0, 1, 13),
                  title: "Event A",
                  description: "",
                  contacts: [],
                  tags: new Set(),
                },
              ],
            },
            {
              title: "Room B",
              items: [
                {
                  id: "e2",
                  type: "event",
                  location: "Room B",
                  start: new Date(2020, 0, 1, 12, 30),
                  end: new Date(2020, 0, 1, 13, 30),
                  title: "Event B",
                  description: "",
                  contacts: [],
                  tags: new Set(),
                },
              ],
            },
          ]}
          {...args}
          start={new Date(2020, 0, 1, 9, 0)}
          end={new Date(2020, 0, 1, 17)}
        />
      </ItemDetailsProvider>
    )
  },
}
