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
