import type { Meta, StoryObj } from "@storybook/react-vite"
import { Track, type TrackItemProps, type TrackProps } from "./track.js"
import dayjs, { Dayjs } from "dayjs"

type Props = TrackProps & {
  item1Start?: Dayjs
  item1End?: Dayjs
  item2Start?: Dayjs
  item2End?: Dayjs
}

const meta: Meta<Props> = {
  component: Track,
  argTypes: {
    startDate: {
      control: "date",
    },
    endDate: {
      control: "date",
    },
    item1Start: {
      control: "date",
    },
    item1End: {
      control: "date",
    },
    item2Start: {
      control: "date",
    },
    item2End: {
      control: "date",
    },
  },
}

export default meta

export const Default: StoryObj<Props> = {
  args: {
    startDate: dayjs(new Date(2020, 0, 1, 9)),
    endDate: dayjs(new Date(2020, 0, 1, 17)),
    item1Start: dayjs(new Date(2020, 0, 1, 10)),
    item1End: dayjs(new Date(2020, 0, 1, 12, 30)),
    item2Start: dayjs(new Date(2020, 0, 1, 14)),
    item2End: dayjs(new Date(2020, 0, 1, 16)),
    orientation: "vertical",
  },
  render({
    startDate: start,
    endDate: end,
    item1Start,
    item1End,
    item2Start,
    item2End,
    ...args
  }) {
    const trackProps: Partial<TrackProps> = {}
    const itemProps: Partial<TrackItemProps> = {}

    if (args.orientation == "horizontal") {
      trackProps.h = 50
      itemProps.top = 0
      itemProps.bottom = 0
    } else {
      trackProps.h = 500
      trackProps.w = 50
      itemProps.left = 0
      itemProps.right = 0
    }

    return (
      <Track
        {...trackProps}
        bd="#000 solid 1px"
        startDate={fixDate(start)}
        endDate={fixDate(end)}
        {...args}
      >
        <Track.Item
          {...itemProps}
          bg="#2f42ac"
          c="#ffffff"
          startDate={fixDate(item1Start)}
          endDate={fixDate(item1End)}
        >
          A
        </Track.Item>
        <Track.Item
          {...itemProps}
          bg="#337c31"
          c="#ffffff"
          startDate={fixDate(item2Start)}
          endDate={fixDate(item2End)}
        >
          B
        </Track.Item>
      </Track>
    )
  },
}

const fixDate = (d?: Dayjs | null | number): Dayjs | null | undefined => {
  if (typeof d == "number") {
    return dayjs(new Date(d))
  } else {
    return d
  }
}
