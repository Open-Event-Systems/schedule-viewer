import type { Meta, StoryObj } from "@storybook/react-vite"
import { SchedulePage } from "./schedule-page.js"
import { parsedConfig, parsedEvents } from "../../test-data.js"
import {
  useCallback,
  useMemo,
  useReducer,
  useState,
  type ComponentPropsWithoutRef,
} from "react"
import { useFilteredItems, type FilterOptions } from "../../hooks/filter.js"
import {
  ItemPills,
  type ItemPillProps,
  type ItemPillsProps,
} from "../pill/item-pills.js"
import { ItemDetails, type ItemDetailsProps } from "../details/item-details.js"
import {
  getDays,
  getDefaultDay,
  makeSelections,
} from "@open-event-systems/schedule-lib"
import { TagFilter } from "../filters/tag-filter.js"
import { makeTagIndicatorFunc } from "../../config.js"
import {
  SelectionsFilter,
  type SelectionsFilterOption,
} from "../filters/selections-filter.js"
import { ViewSelect } from "../view-select/view-select.js"
import { TextFilter } from "../filters/text-filter.js"
import { PastEventsFilter } from "../filters/past-events-filter.js"
import { ShareMenu } from "../share-menu/share-menu.js"
import { Schedule } from "../schedule/schedule-component.js"
import dayjs from "dayjs"

const meta: Meta<typeof SchedulePage> = {
  component: SchedulePage,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    enableFeatures: {
      control: "check",
      options: [
        "bookmarked-filter",
        "unvisited-filter",
        "past-events-filter",
        "share",
        "sync",
        "export",
      ],
    },
  },
}

export default meta

type Options = FilterOptions & {
  selectedDayKey?: string
}

export const Default: StoryObj<typeof SchedulePage> = {
  args: {
    enableFeatures: [
      "bookmarked-filter",
      "unvisited-filter",
      "past-events-filter",
      "share",
      "sync",
      "export",
    ],
  },
  render(args) {
    const [
      {
        disabledTags,
        selectionsFilterOptions,
        showPastEvents,
        text,
        selectedDayKey,
      },
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
        selectionsFilterOptions: [] as readonly SelectionsFilterOption[],
        showPastEvents: false,
        text: "",
      },
    )

    const [type, setType] =
      useState<ComponentPropsWithoutRef<typeof Schedule>["type"]>(
        "daily-agenda",
      )
    const [bookmarks, setBookmarks] = useState(makeSelections())
    const [visited, setVisited] = useState(makeSelections())

    const days = useMemo(
      () =>
        getDays(
          [...parsedEvents].filter(
            (e): e is typeof e & { readonly startDate: Date } => !!e.startDate,
          ),
        ),
      [],
    )
    const selectedDay = days.find((d) => d.key == selectedDayKey)
    const defaultDay = getDefaultDay(days, dayjs())

    const renderDetails = useCallback(
      (props: ItemDetailsProps) => {
        return (
          <ItemDetails
            {...props}
            buttonOptions={["bookmark", "visited", "share"]}
            bookmarked={!!props.itemId && bookmarks.has(props.itemId)}
            visited={!!props.itemId && visited.has(props.itemId)}
            shareURL={`#${props.itemId}`}
            getLocationProps={(loc) => ({
              href: "#",
              onClick: (e) => e.preventDefault(),
              children: String(loc),
            })}
            tagEntries={parsedConfig.tags}
            bookmarkCount={
              !!props.itemId && bookmarks.has(props.itemId) ? 1 : undefined
            }
            onSelectOption={(opt) => {
              if (opt == "bookmark") {
                setBookmarks((cur) => {
                  if (props.itemId) {
                    if (!bookmarks.has(props.itemId)) {
                      return cur.add(props.itemId)
                    } else {
                      return cur.delete(props.itemId)
                    }
                  } else {
                    return cur
                  }
                })
              } else if (opt == "visited") {
                setVisited((cur) => {
                  if (props.itemId) {
                    if (!visited.has(props.itemId)) {
                      return cur.add(props.itemId)
                    } else {
                      return cur.delete(props.itemId)
                    }
                  } else {
                    return cur
                  }
                })
              }
            }}
          />
        )
      },
      [bookmarks, setBookmarks, visited, setVisited],
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
            indicator={tagIndicatorFunc(
              "keywords" in props.item ? (props.item.keywords ?? []) : [],
            )}
            ItemHoverCardProps={{ renderItemDetails: renderDetails }}
          />
        )
      },
      [bookmarks, setBookmarks, renderDetails],
    )

    const renderItemPills = useCallback(
      (props: ItemPillsProps) => {
        return <ItemPills {...props} renderPill={renderPill} />
      },
      [renderPill],
    )

    const filtered = useFilteredItems(parsedEvents, {
      disabledTags,
      selectionsFilterOptions,
      text,
      showPastEvents,
      bookmarked: bookmarks,
      visited,
    })

    return (
      <SchedulePage
        w="100dvw"
        h="100dvh"
        p="xs"
        {...args}
        tags={parsedConfig.tags}
        renderSelectionsFilter={(props) => (
          <SelectionsFilter
            {...props}
            value={selectionsFilterOptions ?? undefined}
            onChange={(selectionsFilterOptions) =>
              dispatch({ selectionsFilterOptions })
            }
          />
        )}
        renderViewSelect={(props) => (
          <ViewSelect
            {...props}
            type={type}
            onChange={(t) =>
              t != null &&
              setType(t as ComponentPropsWithoutRef<typeof Schedule>["type"])
            }
          />
        )}
        renderTextFilter={(props) => (
          <TextFilter
            {...props}
            value={text ?? undefined}
            onChange={(e) => dispatch({ text: e.target.value })}
          />
        )}
        renderPastEventsFilter={(props) => (
          <PastEventsFilter
            {...props}
            checked={showPastEvents ?? undefined}
            onChange={(e) => dispatch({ showPastEvents: e.target.checked })}
          />
        )}
        renderTagFilter={(props) => (
          <TagFilter
            {...props}
            tagIndicators={parsedConfig.tagIndicators}
            disabledTags={disabledTags ?? undefined}
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
            items={filtered}
            type={type}
            days={days}
            tags={parsedConfig.tags}
            selectedDay={selectedDay ?? defaultDay}
            onSelectDay={(d) => dispatch({ selectedDayKey: d.key })}
            renderItemPills={renderItemPills}
          />
        )}
      />
    )
  },
}
