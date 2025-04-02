import { Meta, StoryObj } from "@storybook/react"
import { MapDetails } from "./map-details.js"
import { useState } from "react"
import { Button } from "@mantine/core"

const meta: Meta<typeof MapDetails> = {
  component: MapDetails,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryObj<typeof MapDetails> = {
  args: {
    title: "Panel Room One",
    description: "Panel Room 1, next to Panel Room 2.",
    type: "location",
    futureEvent: {
      id: "future-event",
      start: new Date(2020, 1, 1, 12),
      end: new Date(2020, 1, 1, 1),
      title: "Future Event",
    },
  },
}

export const Now_and_Later: StoryObj<typeof MapDetails> = {
  args: {
    title: "Panel Room One",
    description: "Panel Room 1, next to Panel Room 2.",
    type: "location",
    currentEvent: {
      id: "future-event",
      start: new Date(2020, 1, 1, 11),
      end: new Date(2020, 1, 1, 12),
      title: "Future Event",
    },
    futureEvent: {
      id: "future-event",
      start: new Date(2020, 1, 1, 12),
      end: new Date(2020, 1, 1, 13),
      title: "Future Event",
    },
  },
}

export const Drawer: StoryObj<typeof MapDetails> = {
  args: {
    title: "Panel Room One",
    description: "Panel Room 1, next to Panel Room 2.",
  },
  render(args) {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <MapDetails.Drawer
          title={args.title}
          description={args.description}
          opened={open}
          onClose={() => setOpen(false)}
        />
      </>
    )
  },
}
