import type { Meta, StoryObj } from "@storybook/react-vite"
import { SchedulePage } from "./schedule-page.js"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import { useCallback, useMemo, useReducer, useState } from "react"
import { Schedule, type ScheduleProps } from "../schedule/schedule.js"
import { useFilteredItems, type FilterOptions } from "../../hooks/filter.js"
import { ItemPills, type ItemPillProps } from "../pill/item-pills.js"
import { ItemDetails, type ItemDetailsProps } from "../details/item-details.js"
import { makeSelections } from "@open-event-systems/schedule-lib"
import { TagFilter } from "../filters/tag-filter.js"
import { makeTagIndicatorFunc } from "../../config.js"
import { BookmarkFilter } from "../filters/bookmark-filter.js"
import { ViewSelect } from "../view-select/view-select.js"
import { TextFilter } from "../filters/text-filter.js"
import { PastEventsFilter } from "../filters/past-events-filter.js"
import { ShareMenu } from "../share-menu/share-menu.js"

const meta: Meta<typeof SchedulePage> = {
  component: SchedulePage,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

type Options = FilterOptions & {
  selectedDayKey?: string
}

export const Default: StoryObj<typeof SchedulePage> = {
  args: {
    hideShareMenu: false,
    hideBookmarkFilter: false,
    hideShowPastEventsFilter: false,
  },
  render(args) {
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
        w="100dvw"
        h="100dvh"
        p="xs"
        {...args}
        renderBookmarkFilter={(props) => (
          <BookmarkFilter
            {...props}
            value={onlyBookmarked}
            onChange={(onlyBookmarked) => dispatch({ onlyBookmarked })}
          />
        )}
        renderViewSelect={(props) => (
          <ViewSelect {...props} type={type} onChange={setType} />
        )}
        renderTextFilter={(props) => (
          <TextFilter
            {...props}
            value={text}
            onChange={(e) => dispatch({ text: e.target.value })}
          />
        )}
        renderPastEventsFilter={(props) => (
          <PastEventsFilter
            {...props}
            checked={showPastEvents}
            onChange={(e) => dispatch({ showPastEvents: e.target.checked })}
          />
        )}
        renderTagFilter={(props) => (
          <TagFilter
            {...props}
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
        )}
        renderShare={(props) => (
          <ShareMenu {...props} enabledOptions={["export", "share", "sync"]} />
        )}
        renderSchedule={(props) => (
          <Schedule
            {...props}
            items={parsedEvents}
            filteredItems={filtered}
            type={type}
            selectedDayKey={selectedDayKey}
            onSelectDay={(d) => dispatch({ selectedDayKey: d.key })}
            renderPill={renderPill}
          />
        )}
      />
    )
  },
}
