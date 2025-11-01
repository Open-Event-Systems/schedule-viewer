import type { Meta, StoryObj } from "@storybook/react-vite"

import { Calendar } from "./calendar.js"
import { useCalendarMarks } from "./utils.js"

import "./calendar.scss"
import { Box } from "@mantine/core"

const start = new Date(2020, 0, 1, 9)
const end = new Date(2020, 0, 1, 17)

const meta: Meta<typeof Calendar> = {
  component: Calendar,
}

export default meta

export const Default: StoryObj<typeof Calendar> = {
  args: {
    orientation: "vertical",
  },
  render(args) {
    const marks = useCalendarMarks(start, end)

    return (
      <Calendar numTracks={3} numCells={8} {...args} start={start} end={end}>
        <Calendar.Background numTracks={3} />
        <Calendar.Marks numMarks={marks.length} />
        <Calendar.Labels>
          {marks.map((s, i) => (
            <Calendar.Label key={i}>{s}</Calendar.Label>
          ))}
        </Calendar.Labels>
        <Calendar.Tracks>
          <Calendar.Track>
            <Calendar.TrackHeader>Room 1</Calendar.TrackHeader>
            <Calendar.TrackContent>
              <Calendar.TrackItem
                bg="cyan"
                start={new Date(2020, 0, 1, 12)}
                end={new Date(2020, 0, 1, 16)}
              >
                Item 1
              </Calendar.TrackItem>
            </Calendar.TrackContent>
          </Calendar.Track>
          <Calendar.Track>
            <Calendar.TrackHeader>Room 2</Calendar.TrackHeader>
          </Calendar.Track>
          <Calendar.Track>
            <Calendar.TrackHeader>Room 3</Calendar.TrackHeader>
          </Calendar.Track>
        </Calendar.Tracks>
      </Calendar>
    )
  },
  decorators: [
    (Story) => (
      <Box w={800} h={500}>
        <Story />
      </Box>
    ),
  ],
}
