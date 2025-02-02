import { toTimezone } from "@open-event-systems/schedule-lib"
import { Meta, StoryObj } from "@storybook/react"
import { parseISO } from "date-fns"

const dateStr = "2025-01-01T17:00:00Z"

export type TZStoryProps = {
  timezone: string
}

export const TZStory = ({ timezone }: TZStoryProps) => {
  try {
    const date = parseISO(dateStr)
    const asTz = toTimezone(date, timezone)

    return (
      <>
        Time {dateStr} in {timezone} is {asTz.toString()}
      </>
    )
  } catch (e) {
    return <>Error {String(e)}</>
  }
}

const meta: Meta<typeof TZStory> = {
  component: TZStory,
  argTypes: {
    timezone: {
      control: "select",
      options: ["America/New_York", "America/Los_Angeles"],
    }
  }
}

export default meta

export const Default: StoryObj<typeof TZStory> = {
  args: {
    timezone: "America/New_York",
  }
}
