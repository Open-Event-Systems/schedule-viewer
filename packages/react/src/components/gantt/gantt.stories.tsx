import type { Meta, StoryObj } from "@storybook/react-vite"
import { Gantt } from "./gantt.js"

const meta: Meta<typeof Gantt> = {
  component: Gantt,
  argTypes: {
    orientation: {
      type: "string",
      options: ["vertical", "horizontal"],
      control: "radio",
    },
  },
}

export default meta

export const Default: StoryObj<typeof Gantt> = {
  args: {
    startDate: new Date(2020, 0, 1, 9),
    endDate: new Date(2020, 0, 1, 17),
    orientation: "vertical",
    tracks: [
      {
        id: "b",
        title: "Lounge",
        items: [
          {
            start: new Date(2020, 0, 1, 11),
            end: new Date(2020, 0, 1, 17),
            c: "#ffffff",
          },
        ],
      },
      {
        id: "a",
        title: "Registration",
        items: [
          {
            start: new Date(2020, 0, 1, 9),
            end: new Date(2020, 0, 1, 14),
            c: "#ffffff",
            children: "Title",
          },
        ],
      },
    ],
  },
  render(args) {
    return <Gantt {...args} />
  },
}
