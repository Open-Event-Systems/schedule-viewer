import { Meta, StoryObj } from "@storybook/react-webpack5"
import { EventPills } from "./event-pills.js"
import { events } from "../../test-data.js"
import { MouseEvent, useCallback } from "react"
import { EventDetailsProvider } from "../details/context.js"

import "./pills.scss"
import "../hovercard/event-hover-card.scss"

const meta: Meta<typeof EventPills> = {
  component: EventPills,
  args: {
    events: events,
  },
}

export default meta

export const Default: StoryObj<typeof EventPills> = {
  render(args) {
    const onClick = useCallback((e: MouseEvent) => {
      e.preventDefault()
    }, [])
    const getHref = useCallback(() => "#", [])
    return (
      <EventDetailsProvider
        value={{
          getHref,
          onClickEvent: onClick,
        }}
      >
        <EventPills {...args} />
      </EventDetailsProvider>
    )
  },
}
