import type { Meta, StoryObj } from "@storybook/react-vite"
import { Gantt } from "./gantt.js"
import dayjs from "dayjs"

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
    startDate: dayjs(new Date(2020, 0, 1, 9)),
    endDate: dayjs(new Date(2020, 0, 1, 17)),
    orientation: "vertical",
    tracks: [
      {
        id: "b",
        name: "Lounge",
        items: [
          {
            startDate: dayjs(new Date(2020, 0, 1, 11)),
            endDate: dayjs(new Date(2020, 0, 1, 17)),
            c: "#ffffff",
          },
        ],
      },
      {
        id: "a",
        name: "Registration",
        items: [
          {
            startDate: dayjs(new Date(2020, 0, 1, 9)),
            endDate: dayjs(new Date(2020, 0, 1, 14)),
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
