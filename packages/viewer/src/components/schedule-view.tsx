import { observer } from "mobx-react-lite"
import { MouseEvent, useCallback, useMemo } from "react"
import { FilterSettings } from "./App.js"
import { getDays, getDefaultDay } from "../utils.js"
import {
  Event,
  EventStore,
  isScheduled,
  makeBookmarkFilter,
  makeDateFilter,
  makePastEventFilter,
  makeSelections,
  makeTagFilter,
  makeTitleFilter,
  Scheduled,
  Selections,
  toTimezone,
} from "@open-event-systems/schedule-lib"
import {
  DayFilter,
  DayFilterDay,
} from "@open-event-systems/schedule-react/components/day-filter/day-filter"
import { Stack, Text } from "@mantine/core"
import { EventPills } from "@open-event-systems/schedule-react/components/pills/event-pills"
import { useTime, ViewerConfig } from "../config.js"
import { EventDetailsProvider } from "@open-event-systems/schedule-react/components/details/context"

export type ScheduleViewProps = {
  config: ViewerConfig
  events: EventStore
  filter: FilterSettings
  selections?: Selections
  counts?: ReadonlyMap<string, number>
  updateSelections?: (selections: Selections) => void
  selectedDay?: string | null
  setSelectedDay?: (day: DayFilterDay) => void
  getHref?: (event: Event) => string
  onClickEvent?: (e: MouseEvent, event: Event) => void
  getLocationHref?: (event: Event) => string | undefined
  onClickLocation?: (event: Event) => void
}

export const ScheduleView = observer((props: ScheduleViewProps) => {
  const {
    config,
    events: allEvents,
    filter,
    selections = makeSelections(),
    counts = new Map(),
    updateSelections,
    selectedDay: selectedDayKey,
    setSelectedDay,
    getHref,
    onClickEvent,
    getLocationHref,
    onClickLocation,
  } = props

  const { text: filterText, disabledTags, showPast, onlyBookmarked } = filter

  const now = useTime()

  const days = useMemo(
    () =>
      getDays(
        Array.from(allEvents).filter(isScheduled),
        config.timeZone,
        config.dayChangeHour,
      ),
    [allEvents, config.timeZone, config.dayChangeHour],
  )

  const defaultDay = useMemo(
    () => getDefaultDay(days, toTimezone(now, config.timeZone)),
    [days, config.timeZone],
  )

  const selectedDay = days.find((d) => d.key == selectedDayKey) || defaultDay

  const getIsBookmarked = useCallback(
    (event: Event) => {
      return selections.events.has(event.id)
    },
    [selections],
  )

  const setBookmarked = useCallback(
    (event: Event, set: boolean) => {
      let newSelections
      if (set) {
        newSelections = makeSelections(
          [...selections.events, event.id],
          new Date(),
        )
      } else {
        const removed = [...selections.events].filter((e) => e != event.id)
        newSelections = makeSelections(removed, new Date())
      }
      updateSelections && updateSelections(newSelections)
    },
    [selections, updateSelections],
  )

  const getBookmarkCount = useCallback(
    (event: Event) => {
      return counts.get(event.id)
    },
    [counts],
  )

  const dayFiltered = useMemo(() => {
    const arr = Array.from(allEvents).filter(isScheduled)
    if (!selectedDay) {
      return arr
    }

    return arr.filter(makeDateFilter(selectedDay))
  }, [allEvents, selectedDay])

  const bookmarkFiltered = useMemo(() => {
    return onlyBookmarked
      ? dayFiltered.filter(makeBookmarkFilter(selections.events))
      : dayFiltered
  }, [dayFiltered, selections, onlyBookmarked])

  const pastFiltered = useMemo(
    () =>
      showPast
        ? bookmarkFiltered
        : bookmarkFiltered.filter(
            makePastEventFilter(toTimezone(now, config.timeZone)),
          ),
    [bookmarkFiltered, showPast, config.timeZone],
  )

  const tagFiltered = useMemo(
    () => pastFiltered.filter(makeTagFilter(disabledTags)),
    [pastFiltered, disabledTags],
  )

  const titleFiltered = useMemo(
    () =>
      filterText
        ? tagFiltered.filter(makeTitleFilter(filterText))
        : tagFiltered,
    [tagFiltered, filterText],
  )

  return (
    <Stack>
      <DayFilter
        days={days}
        selectedDay={selectedDay?.key}
        onSelectDay={setSelectedDay}
      />
      {titleFiltered.length > 0 ? (
        <EventDetailsProvider
          value={{
            getBookmarkCount,
            getIsBookmarked,
            setBookmarked,
            getHref,
            onClickEvent,
            getLocationHref,
            onClickLocation,
          }}
        >
          <PillsView events={titleFiltered} binMinutes={config.binMinutes} />
        </EventDetailsProvider>
      ) : (
        <Text c="dimmed" ta="center">
          No events
        </Text>
      )}
    </Stack>
  )
})

ScheduleView.displayName = "ScheduleView"

type ViewProps = {
  events: readonly Scheduled<Event>[]
  binMinutes?: number
}

const PillsView = (props: ViewProps) => {
  const { events, binMinutes } = props
  return <EventPills events={events} binMinutes={binMinutes} />
}
