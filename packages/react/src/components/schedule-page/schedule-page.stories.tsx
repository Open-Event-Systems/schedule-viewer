import type { Meta, StoryObj } from "@storybook/react-vite"
import { SchedulePage } from "./schedule-page.js"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import { useCallback, useState } from "react"
import type { ScheduleProps } from "../schedule/schedule.js"
import type { Day } from "@open-event-systems/schedule-lib"
import type { PillsItemType } from "../pills/bin.js"
import type { ItemDetailsProps } from "../details/item-details.js"
import { Pills, type PillProps } from "../pills/pills.js"

const meta: Meta<typeof SchedulePage> = {
  component: SchedulePage,
}

export default meta

export const Default: StoryObj<typeof SchedulePage> = {
  render() {
    const [type, setType] = useState<ScheduleProps["type"]>("daily-agenda")
    const [day, setDay] = useState<Day | undefined>(undefined)

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
      <SchedulePage
        items={parsedEvents}
        filteredItems={parsedEvents}
        type={type}
        onChangeType={setType}
        selectedDayKey={day?.key}
        onSelectDay={setDay}
        renderPill={renderPill}
      />
    )
  },
}
