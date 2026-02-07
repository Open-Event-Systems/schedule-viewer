import type { Meta, StoryObj } from "@storybook/react-vite"
import { SchedulePage } from "./schedule-page.js"
import { parsedEvents } from "../../test-data.js"
import { useCallback, useReducer, useState } from "react"
import type { ScheduleProps } from "../schedule/schedule.js"
import {
  FilterContext,
  useFilteredItems,
  type FilterSettings,
} from "../../hooks/filter.js"
import { ItemPill, type ItemPillProps } from "../pill/item-pill.js"
import { ItemDetails, type ItemDetailsProps } from "../details/item-details.js"
import { makeSelections } from "@open-event-systems/schedule-lib"

const meta: Meta<typeof SchedulePage> = {
  component: SchedulePage,
}

export default meta

export const Default: StoryObj<typeof SchedulePage> = {
  render() {
    const [type, setType] = useState<ScheduleProps["type"]>("daily-agenda")
    const [selections, setSelections] = useState(makeSelections())

    const renderDetails = useCallback(
      (props: ItemDetailsProps) => {
        return (
          <ItemDetails
            {...props}
            bookmarked={selections.has(props.item.id)}
            url={`#${props.item.id}`}
            locationHref={`#${props.item.location}`}
            onClickLocation={(e) => {
              e.preventDefault()
            }}
            bookmarkCount={selections.has(props.item.id) ? 1 : undefined}
            setBookmarked={(s) =>
              setSelections((cur) => {
                if (s) {
                  return cur.add(props.item.id)
                } else {
                  return cur.delete(props.item.id)
                }
              })
            }
          />
        )
      },
      [selections, setSelections],
    )

    const renderPill = useCallback(
      (props: ItemPillProps) => {
        return (
          <ItemPill
            {...props}
            ItemHoverCardProps={{ renderItemDetails: renderDetails }}
          />
        )
      },
      [selections, setSelections, renderDetails],
    )

    const filtered = useFilteredItems(parsedEvents, new Date(), selections)

    return (
      <SchedulePage
        items={parsedEvents}
        filteredItems={filtered}
        type={type}
        onChangeType={setType}
        renderPill={renderPill}
      />
    )
  },
  decorators: [
    (Story) => {
      const filterCtx = useReducer(
        (prevState: FilterSettings, action: FilterSettings) => {
          return {
            ...prevState,
            ...action,
          }
        },
        {
          disabledTags: new Set<string>(),
          onlyBookmarked: false,
          showPastEvents: false,
          text: "",
        },
      )
      return (
        <FilterContext value={filterCtx}>
          <Story />
        </FilterContext>
      )
    },
  ],
}
