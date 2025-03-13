import { Meta, StoryObj } from "@storybook/react"
import { IconText } from "./icon-text.js"
import { IconGps } from "@tabler/icons-react"

import "./icon-text.scss"

const meta: Meta<typeof IconText> = {
  component: IconText,
}

export default meta

export const Default: StoryObj<typeof IconText> = {
  args: {
    icon: <IconGps />,
    children: "Example Text",
    c: "dimmed",
  },
}
