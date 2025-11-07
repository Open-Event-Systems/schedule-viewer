import type { Meta, StoryObj } from "@storybook/react-vite"
import { Schedule } from "./schedule.js"
import { type Day } from "@open-event-systems/schedule-lib"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import { useCallback, useState } from "react"
import type { PillsItemType } from "../pills/bin.js"
import type { ItemDetailsProps } from "../details/item-details.js"
import { Pills, type PillProps } from "../pills/pills.js"

const meta: Meta<typeof Schedule> = {
  component: Schedule,
  args: {
    type: "daily-agenda",
  },
}

export default meta

export const Default: StoryObj<typeof Schedule> = {
  render(args) {
    const [selectedDay, setSelectedDay] = useState<Day | undefined>(undefined)

    const getDetailsProps = useCallback((): Partial<ItemDetailsProps> => {
      return {
        locationHref: "#",
        onClickLocation(e) {
          e.preventDefault()
        },
        tags: parsedConfig.tags,
      }
    }, [parsedConfig.tags])

    const renderPill = useCallback(
      (props: PillProps, item: PillsItemType) => {
        return (
          <Pills.Pill
            {...props}
            key={item.id}
            item={item}
            href="#"
            onClick={(e) => {
              e.preventDefault()
            }}
            hasItemDetailsHoverCard
            ItemDetailsProps={getDetailsProps}
          />
        )
      },
      [getDetailsProps],
    )

    return (
      <Schedule
        {...args}
        items={parsedEvents}
        selectedDayKey={selectedDay?.key}
        onSelectDay={setSelectedDay}
        renderPill={renderPill}
      />
    )
  },
}
