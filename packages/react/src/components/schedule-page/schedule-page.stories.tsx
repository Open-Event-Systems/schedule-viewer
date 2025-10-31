import type { Meta, StoryObj } from "@storybook/react-vite"
import { SchedulePage } from "./schedule-page.js"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import { useCallback, useState, type MouseEvent, type ReactNode } from "react"
import type { ScheduleProps } from "../schedule/schedule.js"
import { useItemDetailsFunc } from "../details/context.js"
import type { Day } from "@open-event-systems/schedule-lib"
import { ItemHoverCard } from "../hovercard/item-hover-card.js"
import { PillPropsContext } from "../pills/context.js"
import type { PillsItemType } from "../pills/bin.js"

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
        const detailsProps = detailsFunc(item)
        return {
          href: "#",
          onClick: (e: MouseEvent) => {
            e.preventDefault()
          },
          renderContent: (c: ReactNode) => {
            return (
              <ItemHoverCard item={item} ItemDetailsProps={detailsProps}>
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
          tags={parsedConfig.tags}
          type={type}
          onChangeType={setType}
          selectedDayKey={day?.key}
          onSelectDay={setDay}
        />
      </PillPropsContext>
    )
  },
}
