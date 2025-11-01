import type { Meta, StoryObj } from "@storybook/react-vite"
import { Schedule } from "./schedule.js"
import { type Day } from "@open-event-systems/schedule-lib"
import { parsedEvents } from "../../test-data.js"
import { useCallback, useState, type MouseEvent, type ReactNode } from "react"
import { ItemHoverCard } from "../hovercard/item-hover-card.js"
import type { PillsItemType } from "../pills/bin.js"
import { PillPropsContext } from "../pills/context.js"
import { useItemDetailsFunc } from "../../hooks/details.js"

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

    const detailsFunc = useItemDetailsFunc()

    const getPillProps = useCallback(
      (item: PillsItemType) => {
        const { ItemDetailsProps } = detailsFunc(item)
        return {
          href: "#",
          onClick: (e: MouseEvent) => {
            e.preventDefault()
          },
          renderContent: (c: ReactNode) => {
            return (
              <ItemHoverCard item={item} ItemDetailsProps={ItemDetailsProps}>
                {c}
              </ItemHoverCard>
            )
          },
        }
      },
      [detailsFunc],
    )

    return (
      <PillPropsContext value={getPillProps}>
        <Schedule
          {...args}
          items={parsedEvents}
          selectedDayKey={selectedDay?.key}
          onSelectDay={setSelectedDay}
        />
      </PillPropsContext>
    )
  },
}
