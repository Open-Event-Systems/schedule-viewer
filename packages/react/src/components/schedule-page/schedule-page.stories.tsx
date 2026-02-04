import type { Meta, StoryObj } from "@storybook/react-vite"
import { SchedulePage } from "./schedule-page.js"
import { parsedEvents } from "../../test-data.js"
import { useCallback, useState } from "react"
import type { ScheduleProps } from "../schedule/schedule.js"
import type { Day } from "@open-event-systems/schedule-lib"
import {
  FilterContext,
  useFilteredItems,
  useFilterState,
} from "../../hooks/filter.js"
import { ItemPill, type ItemPillProps } from "../pill/item-pill.js"
import { ItemDetails, type ItemDetailsProps } from "../details/item-details.js"
import { Observer, useLocalObservable } from "mobx-react-lite"
import { makeObservableSet } from "../../utils/basic-set.js"
import { action } from "mobx"

const meta: Meta<typeof SchedulePage> = {
  component: SchedulePage,
}

export default meta

export const Default: StoryObj<typeof SchedulePage> = {
  render() {
    const [type, setType] = useState<ScheduleProps["type"]>("daily-agenda")
    const [day, setDay] = useState<Day | undefined>(undefined)
    const [selections, setSelections] = useState(new Set<string>())

    const filtered = useFilteredItems(parsedEvents, new Date(), {
      items: selections,
    })

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
                const newSet = new Set(cur)
                if (s) {
                  newSet.add(props.item.id)
                } else {
                  newSet.delete(props.item.id)
                }
                return newSet
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

    return (
      <SchedulePage
        items={parsedEvents}
        filteredItems={filtered}
        type={type}
        onChangeType={setType}
        selectedDayKey={day?.key}
        onSelectDay={setDay}
        renderPill={renderPill}
      />
    )
  },
  decorators: [
    (Story) => {
      const filterCtx = useFilterState()
      return (
        <FilterContext value={filterCtx}>
          <Story />
        </FilterContext>
      )
    },
  ],
}

export const With_MobX: StoryObj<typeof SchedulePage> = {
  render() {
    const [type, setType] = useState<ScheduleProps["type"]>("daily-agenda")
    const [day, setDay] = useState<Day | undefined>(undefined)
    const selections = useLocalObservable(() => makeObservableSet<string>())
    const setSelections = useCallback(
      action((id: string, selected: boolean) => {
        if (selected) {
          selections.add(id)
        } else {
          selections.delete(id)
        }
      }),
      [selections],
    )

    const filtered = useFilteredItems(parsedEvents, new Date(), {
      items: new Set(selections),
    })

    const renderDetails = useCallback(
      (props: ItemDetailsProps) => {
        return (
          <Observer>
            {() => (
              <ItemDetails
                {...props}
                bookmarked={selections.has(props.item.id)}
                url={`#${props.item.id}`}
                locationHref={`#${props.item.location}`}
                onClickLocation={(e) => {
                  e.preventDefault()
                }}
                bookmarkCount={selections.has(props.item.id) ? 1 : undefined}
                setBookmarked={(s) => setSelections(props.item.id, s)}
              />
            )}
          </Observer>
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

    return (
      <SchedulePage
        items={parsedEvents}
        filteredItems={filtered}
        type={type}
        onChangeType={setType}
        selectedDayKey={day?.key}
        onSelectDay={setDay}
        renderPill={renderPill}
      />
    )
  },
  decorators: [
    (Story) => {
      const filterCtx = useFilterState()
      return (
        <FilterContext value={filterCtx}>
          <Story />
        </FilterContext>
      )
    },
  ],
}
