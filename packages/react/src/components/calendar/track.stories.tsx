import type { Meta, StoryObj } from "@storybook/react-vite"
import { Track, type TrackItemProps, type TrackProps } from "./track.js"

type Props = TrackProps & {
  item1Start?: Date
  item1End?: Date
  item2Start?: Date
  item2End?: Date
}

const meta: Meta<Props> = {
  component: Track,
  argTypes: {
    start: {
      control: "date",
    },
    end: {
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
    start: new Date(2020, 0, 1, 9),
    end: new Date(2020, 0, 1, 17),
    item1Start: new Date(2020, 0, 1, 10),
    item1End: new Date(2020, 0, 1, 12, 30),
    item2Start: new Date(2020, 0, 1, 14),
    item2End: new Date(2020, 0, 1, 16),
    orientation: "vertical",
  },
  render({ start, end, item1Start, item1End, item2Start, item2End, ...args }) {
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
        start={fixDate(start)}
        end={fixDate(end)}
        {...args}
      >
        <Track.Item
          {...itemProps}
          bg="#2f42ac"
          c="#ffffff"
          start={fixDate(item1Start)}
          end={fixDate(item1End)}
        >
          A
        </Track.Item>
        <Track.Item
          {...itemProps}
          bg="#337c31"
          c="#ffffff"
          start={fixDate(item2Start)}
          end={fixDate(item2End)}
        >
          B
        </Track.Item>
      </Track>
    )
  },
}

const fixDate = (d?: Date | null | number): Date | null | undefined => {
  if (typeof d == "number") {
    return new Date(d)
  } else {
    return d
  }
}
