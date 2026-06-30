import type { Meta, StoryObj } from "@storybook/react-vite"
import { Calendar } from "./calendar.js"
import { Box } from "@mantine/core"
import { useCalendarMarks, useCalendarTimes } from "./hooks.js"
import dayjs from "dayjs"

const meta: Meta<typeof Calendar> = {
  component: Calendar,
}

export default meta

export const Default: StoryObj<typeof Calendar> = {
  render(args) {
    const start = dayjs(new Date(2020, 0, 1, 9))
    const end = dayjs(new Date(2020, 0, 1, 12))

    const times = useCalendarTimes(start, end)
    const timeEls = times.map((t, i) => (
      <Calendar.Time key={i}>{t}</Calendar.Time>
    ))

    const marks = useCalendarMarks(start, end)
    const markEls = marks.map((p, i) => <Calendar.Mark key={i} {...p} />)

    return (
      <Calendar mih={400} startDate={start} endDate={end} {...args}>
        <Calendar.Backgrounds>
          <Calendar.Background />
          <Calendar.Background />
          <Calendar.Background />
        </Calendar.Backgrounds>
        <Calendar.Times>{timeEls}</Calendar.Times>
        <Calendar.Marks>{markEls}</Calendar.Marks>
        <Calendar.Headers>
          <Calendar.Header>Header 1</Calendar.Header>
          <Calendar.Header>Header 2</Calendar.Header>
          <Calendar.Header>Header 3</Calendar.Header>
        </Calendar.Headers>
        <Calendar.Tracks>
          <Calendar.Track>
            <Calendar.Item
              startDate={dayjs(new Date(2020, 0, 1, 11))}
              endDate={dayjs(new Date(2020, 0, 1, 12))}
              renderRoot={(props) => (
                <Box bg="#1f711f" c="#ffffff" {...props} />
              )}
            >
              T1
            </Calendar.Item>
          </Calendar.Track>
          <Calendar.Track>
            <Calendar.Item
              startDate={dayjs(new Date(2020, 0, 1, 9))}
              endDate={dayjs(new Date(2020, 0, 1, 10, 30))}
              renderRoot={(props) => (
                <Box bg="#2c1766" c="#ffffff" {...props} />
              )}
            >
              T2
            </Calendar.Item>
          </Calendar.Track>
          <Calendar.Track>
            <Calendar.Item
              startDate={dayjs(new Date(2020, 0, 1, 10, 30))}
              endDate={dayjs(new Date(2020, 0, 1, 11, 30))}
              renderRoot={(props) => (
                <Box bg="#641414" c="#ffffff" {...props} />
              )}
            >
              T3
            </Calendar.Item>
          </Calendar.Track>
        </Calendar.Tracks>
      </Calendar>
    )
  },
}
