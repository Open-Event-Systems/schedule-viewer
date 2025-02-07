import { EventPills } from "@open-event-systems/schedule-components/pills/EventPills"
import { eventsDataRoute } from "./index.js"
import { Grid, Text } from "@mantine/core"
import { DayFilter } from "@open-event-systems/schedule-components/day-filter/DayFilter"
import { useCallback, useMemo, useState } from "react"
import {
  Event,
  isScheduled,
  makeDateFilter,
  makePastEventFilter,
  makeTagFilter,
  makeTitleFilter,
  toTimezone,
} from "@open-event-systems/schedule-lib"
import { Filter } from "@open-event-systems/schedule-components/filter/Filter"
import { observer } from "mobx-react-lite"
import { getDays, getDefaultDay } from "../utils.js"

export const EventsRoute = observer(() => {
  const { events: allEvents, config } = eventsDataRoute.useLoaderData()
  const { bookmarkStore } = eventsDataRoute.useRouteContext()
  const [filterText, setFilterText] = useState("")
  const [disabledTags, setDisabledTags] = useState<ReadonlySet<string>>(
    new Set()
  )
  const [showPast, setShowPast] = useState(false)

  const days = useMemo(
    () =>
      getDays(
        Array.from(allEvents).filter(isScheduled),
        config.timeZone,
        config.dayChangeHour
      ),
    [allEvents, config.timeZone, config.dayChangeHour]
  )

  const defaultDay = useMemo(
    () => getDefaultDay(days, toTimezone(new Date(), config.timeZone)),
    [days, config.timeZone]
  )

  const [selectedDay, setSelectedDay] = useState(defaultDay)

  const getIsBookmarked = useCallback(
    (event: Event) => {
      return bookmarkStore.bookmarkedEvents.has(event.id)
    },
    [bookmarkStore.bookmarkedEvents]
  )

  const setBookmarked = useCallback(
    (event: Event, set: boolean) => {
      if (set) {
        bookmarkStore.add(event.id)
      } else {
        bookmarkStore.remove(event.id)
      }
    },
    [bookmarkStore]
  )

  const dayFiltered = useMemo(() => {
    const arr = Array.from(allEvents)
    if (!selectedDay) {
      return arr
    }

    return arr.filter(makeDateFilter(selectedDay))
  }, [allEvents, selectedDay])

  const pastFiltered = useMemo(
    () =>
      showPast
        ? dayFiltered
        : dayFiltered.filter(
            makePastEventFilter(toTimezone(new Date(), config.timeZone))
          ),
    [dayFiltered, showPast, config.timeZone]
  )

  const tagFiltered = useMemo(
    () => pastFiltered.filter(makeTagFilter(disabledTags)),
    [pastFiltered, disabledTags]
  )

  const titleFiltered = useMemo(
    () =>
      filterText
        ? tagFiltered.filter(makeTitleFilter(filterText))
        : tagFiltered,
    [tagFiltered, filterText]
  )

  return (
    <Grid>
      <Grid.Col span={{ xs: 12, sm: 8 }} order={{ base: 2, xs: 2, sm: 1 }}>
        <DayFilter
          days={days}
          selectedDay={selectedDay?.key}
          onSelectDay={setSelectedDay}
        />
        {titleFiltered.length > 0 ? (
          <EventPills
            events={titleFiltered}
            getIsBookmarked={getIsBookmarked}
            setBookmarked={setBookmarked}
          />
        ) : (
          <Text c="dimmed" ta="center" p="md">
            No events
          </Text>
        )}
      </Grid.Col>
      <Grid.Col span={{ xs: 12, sm: 4 }} order={{ base: 1, xs: 1, sm: 2 }}>
        <Filter
          text={filterText}
          tags={allEvents.tags}
          disabledTags={disabledTags}
          showPastEvents={showPast}
          onChangeText={setFilterText}
          onChangeTags={setDisabledTags}
          onChangeShowPastEvents={setShowPast}
        />
      </Grid.Col>
    </Grid>
  )
})

EventsRoute.displayName = "EventsRoute"
