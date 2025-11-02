import type { Meta, StoryObj } from "@storybook/react-vite"
import { SchedulePage } from "./schedule-page.js"
import { parsedEvents } from "../../test-data.js"
import { useCallback, useState, type MouseEvent, type ReactNode } from "react"
import type { ScheduleProps } from "../schedule/schedule.js"
import type { Day } from "@open-event-systems/schedule-lib"
import { ItemHoverCard } from "../hovercard/item-hover-card.js"
import type { PillsItemType } from "../pills/bin.js"
import { useItemDetailsFunc } from "../../hooks/details.js"
import { PillPropsContext } from "../../hooks/pills.js"

const meta: Meta<typeof SchedulePage> = {
  component: SchedulePage,
}

export default meta

export const Default: StoryObj<typeof SchedulePage> = {
  render() {
    const [type, setType] = useState<ScheduleProps["type"]>("daily-agenda")
    const [day, setDay] = useState<Day | undefined>(undefined)

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
        <SchedulePage
          items={parsedEvents}
          type={type}
          onChangeType={setType}
          selectedDayKey={day?.key}
          onSelectDay={setDay}
        />
      </PillPropsContext>
    )
  },
}
