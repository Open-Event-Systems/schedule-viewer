import { Meta, StoryObj } from "@storybook/react-webpack5"
import { binItemsByTime, EventPills } from "./event-pills.js"
import { events, tagEntries } from "../../test-data.js"
import { MouseEvent, useCallback } from "react"
import {
  EventDetailsProvider,
  makeEventDetailsFunc,
} from "../details/context.js"

import "../details/item-details.scss"
import "../hovercard/item-hover-card.scss"
import "./pills.scss"

const meta: Meta<typeof EventPills> = {
  component: EventPills,
  args: {},
}

export default meta

export const Default: StoryObj<typeof EventPills> = {
  render(args) {
    const onClick = useCallback((e: MouseEvent) => {
      e.preventDefault()
    }, [])
    const getHref = useCallback(() => "#", [])

    const bins = binItemsByTime(events, 30)

    return (
      <EventDetailsProvider
        value={makeEventDetailsFunc({
          getHref,
          onClickEvent: onClick,
          tags: tagEntries,
        })}
      >
        <EventPills {...args} bins={bins} />
      </EventDetailsProvider>
    )
  },
}
