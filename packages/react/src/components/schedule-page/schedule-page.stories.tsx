import type { Meta, StoryObj } from "@storybook/react-vite"
import { SchedulePage } from "./schedule-page.js"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import { useCallback, useMemo, useReducer, useState } from "react"
import { Schedule, type ScheduleProps } from "../schedule/schedule.js"
import { useFilteredItems, type FilterOptions } from "../../hooks/filter.js"
import { ItemPills, type ItemPillProps } from "../pill/item-pills.js"
import { ItemDetails, type ItemDetailsProps } from "../details/item-details.js"
import { makeSelections } from "@open-event-systems/schedule-lib"
import { Filter } from "../filter/filter.js"
import { TagFilter } from "../tag-filter/tag-filter.js"
import { makeTagIndicatorFunc } from "../../config.js"

const meta: Meta<typeof SchedulePage> = {
  component: SchedulePage,
}

export default meta

type Options = FilterOptions & {
  selectedDayKey?: string
}

export const Default: StoryObj<typeof SchedulePage> = {
  render() {
    const [
      { disabledTags, onlyBookmarked, showPastEvents, text, selectedDayKey },
      dispatch,
    ] = useReducer(
      (prevState: Options, action: Partial<Options>) => {
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

    const tagIndicatorFunc = useMemo(
      () => makeTagIndicatorFunc(parsedConfig.tagIndicators),
      parsedConfig.tagIndicators,
    )

    const renderPill = useCallback(
      (props: ItemPillProps) => {
        return (
          <ItemPills.Pill
            {...props}
            indicator={tagIndicatorFunc(props.item.tags ?? [])}
            ItemHoverCardProps={{ renderItemDetails: renderDetails }}
          />
        )
      },
      [selections, setSelections, renderDetails],
    )

    const filtered = useFilteredItems(parsedEvents, {
      disabledTags,
      onlyBookmarked,
      text,
      showPastEvents,
      selections,
    })

    return (
      <SchedulePage
        filteredItems={filtered}
        type={type}
        onChangeType={setType}
        bookmarkFilter={
          <SchedulePage.BookmarkFilter
            value={onlyBookmarked}
            onChange={(onlyBookmarked) => dispatch({ onlyBookmarked })}
          />
        }
        filter={
          <Filter
            text={
              <Filter.Text
                value={text}
                onChange={(e) => dispatch({ text: e.target.value })}
              />
            }
            pastEvents={
              <Filter.PastEvents
                checked={showPastEvents}
                onChange={(e) => dispatch({ showPastEvents: e.target.checked })}
              />
            }
            tagFilter={
              <TagFilter
                tags={parsedConfig.tags}
                tagIndicators={parsedConfig.tagIndicators}
                disabledTags={disabledTags}
                onSetDisabled={(tag, disabled) => {
                  const newSet = new Set(disabledTags)
                  if (disabled) {
                    newSet.add(tag)
                  } else {
                    newSet.delete(tag)
                  }

                  dispatch({ disabledTags: newSet })
                }}
              />
            }
          />
        }
        schedule={
          <Schedule
            items={parsedEvents}
            filteredItems={filtered}
            type={type}
            selectedDayKey={selectedDayKey}
            onSelectDay={(d) => dispatch({ selectedDayKey: d.key })}
            renderPill={renderPill}
          />
        }
      />
    )
  },
}
