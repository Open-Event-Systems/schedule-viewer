import type { Meta, StoryObj } from "@storybook/react-vite"
import { Gantt } from "./gantt.js"
import { Calendar } from "../calendar/calendar.js"
import { useCalendarMarks } from "../calendar/utils.js"
import { Box } from "@mantine/core"

const meta: Meta<typeof Gantt> = {
  component: Gantt,
}

export default meta

const start = new Date(2020, 0, 1, 9)
const end = new Date(2020, 0, 1, 17)

export const Default: StoryObj<typeof Gantt> = {
  args: {
    orientation: "vertical",
  },
  render(args) {
    const marks = useCalendarMarks(start, end)
    return (
      <Gantt {...args} numTracks={3} numCells={8} start={start} end={end}>
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
                className="Gantt-bar"
                bg="cyan"
                start={new Date(2020, 0, 1, 12)}
                end={new Date(2020, 0, 1, 16)}
              ></Calendar.TrackItem>
              <Calendar.TrackItem
                className="Gantt-bar"
                bg="grape"
                start={new Date(2020, 0, 1, 14)}
                end={new Date(2020, 0, 1, 15)}
              ></Calendar.TrackItem>
            </Calendar.TrackContent>
          </Calendar.Track>
          <Calendar.Track>
            <Calendar.TrackHeader>Room 2</Calendar.TrackHeader>
            <Calendar.TrackContent>
              <Calendar.TrackItem
                className="Gantt-bar"
                bg="cyan"
                start={new Date(2020, 0, 1, 10)}
                end={new Date(2020, 0, 1, 12)}
              >
                <Gantt.BarLabel>Bar Label</Gantt.BarLabel>
              </Calendar.TrackItem>
            </Calendar.TrackContent>
          </Calendar.Track>
          <Calendar.Track>
            <Calendar.TrackHeader>Room 3</Calendar.TrackHeader>
          </Calendar.Track>
        </Calendar.Tracks>
      </Gantt>
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
