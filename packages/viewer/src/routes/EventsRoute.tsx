import { EventPills } from "@open-event-systems/schedule-components/pills/EventPills"
import { eventRoute, eventsDataRoute, eventsRoute } from "./index.js"
import { Anchor, Grid, SegmentedControl, Stack, Text } from "@mantine/core"
import {
  DayFilter,
  DayFilterDay,
} from "@open-event-systems/schedule-components/day-filter/DayFilter"
import { MouseEvent, useCallback, useContext, useMemo, useState } from "react"
import {
  Event,
  isScheduled,
  makeDateFilter,
  makePastEventFilter,
  makeTagFilter,
  makeTitleFilter,
  Scheduled,
  toTimezone,
} from "@open-event-systems/schedule-lib"
import { Filter } from "@open-event-systems/schedule-components/filter/Filter"
import { observer } from "mobx-react-lite"
import { getDays, getDefaultDay } from "../utils.js"
import { createICS } from "../ical.js"
import { useLocation, useRouter } from "@tanstack/react-router"
import { makeBookmarkFilter } from "@open-event-systems/schedule-lib"
import { useEvents } from "../schedule.js"
import {
  useBookmarkCounts,
  useBookmarks,
  useUpdateBookmarks,
} from "../bookmarks.js"
import { FilterContext } from "../components/App.js"

export const EventsRoute = observer(() => {
  const { config } = eventsDataRoute.useRouteContext()
  const allEvents = useEvents(config.url, config.timeZone)
  const selections = useBookmarks(config.id)
  const counts = useBookmarkCounts(config.id)
  const updateSelections = useUpdateBookmarks(config.id)

  const [filter, setFilter] = useContext(FilterContext)
  const { text: filterText, disabledTags, showPast, onlyBookmarked } = filter

  const days = useMemo(
    () =>
      getDays(
        Array.from(allEvents).filter(isScheduled),
        config.timeZone,
        config.dayChangeHour,
      ),
    [allEvents, config.timeZone, config.dayChangeHour],
  )

  // const rooms = useMemo(() => {
  //   const set = new Set<string>()
  //   for (const event of allEvents) {
  //     if (event.location) {
  //       set.add(event.location)
  //     }
  //   }
  //   return Array.from(set)
  // }, [allEvents])

  const defaultDay = useMemo(
    () => getDefaultDay(days, toTimezone(new Date(), config.timeZone)),
    [days, config.timeZone],
  )

  const loc = useLocation()
  const navigate = eventsRoute.useNavigate()
  const router = useRouter()

  const hashParams = new URLSearchParams(loc.hash)
  const selectedDayKey = hashParams.get("day")

  const setSelectedDay = useCallback(
    (day: DayFilterDay) => {
      navigate({
        hash: `day=${day.key}`,
        replace: true,
      })
    },
    [navigate],
  )

  const selectedDay = days.find((d) => d.key == selectedDayKey) || defaultDay

  const getHref = useCallback(
    (event: Event) => {
      return router.history.createHref(
        router.buildLocation({
          to: eventRoute.to,
          params: {
            eventId: event.id,
          },
        }).href,
      )
    },
    [router],
  )

  const onClick = useCallback(
    (e: MouseEvent, event: Event) => {
      e.preventDefault()
      navigate({
        to: eventRoute.to,
        params: {
          eventId: event.id,
        },
      })
    },
    [navigate],
  )

  const getIsBookmarked = useCallback(
    (event: Event) => {
      return selections.has(event.id)
    },
    [selections],
  )

  const setBookmarked = useCallback(
    (event: Event, set: boolean) => {
      let newSelections
      if (set) {
        newSelections = selections.add(event.id)
      } else {
        newSelections = selections.delete(event.id)
      }
      updateSelections(newSelections)
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
      ? dayFiltered.filter(makeBookmarkFilter(selections))
      : dayFiltered
  }, [dayFiltered, selections, onlyBookmarked])

  const pastFiltered = useMemo(
    () =>
      showPast
        ? bookmarkFiltered
        : bookmarkFiltered.filter(
            makePastEventFilter(toTimezone(new Date(), config.timeZone)),
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
    <Grid>
      <Grid.Col span={{ xs: 12, sm: 8 }} order={{ base: 2, xs: 2, sm: 1 }}>
        <Stack>
          <SegmentedControl
            fullWidth
            data={[
              { label: "All Events", value: "all" },
              { label: "My Schedule", value: "bookmarked" },
            ]}
            value={onlyBookmarked ? "bookmarked" : "all"}
            onChange={(v) => {
              setFilter({ ...filter, onlyBookmarked: v == "bookmarked" })
            }}
          />
          <DayFilter
            days={days}
            selectedDay={selectedDay?.key}
            onSelectDay={setSelectedDay}
          />
          {titleFiltered.length > 0 ? (
            <PillsView
              events={titleFiltered}
              binMinutes={config.binMinutes}
              getIsBookmarked={getIsBookmarked}
              setBookmarked={setBookmarked}
              getBookmarkCount={getBookmarkCount}
              getHref={getHref}
              onClickEvent={onClick}
            />
          ) : (
            <Text c="dimmed" ta="center">
              No events
            </Text>
          )}
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ xs: 12, sm: 4 }} order={{ base: 1, xs: 1, sm: 2 }}>
        <Stack align="end" gap="xs">
          <Filter
            text={filterText}
            tags={Array.from(allEvents.tags).sort()}
            disabledTags={disabledTags}
            showPastEvents={showPast}
            onChangeText={(text: string) => setFilter({ ...filter, text })}
            onChangeTags={(disabledTags: Set<string>) =>
              setFilter({ ...filter, disabledTags })
            }
            onChangeShowPastEvents={(showPast: boolean) =>
              setFilter({ ...filter, showPast })
            }
          />
          <Anchor
            component="button"
            onClick={() => {
              let events = Array.from(allEvents).filter(isScheduled)

              if (filterText) {
                events = events.filter(makeTitleFilter(filterText))
              }

              events = events.filter(makeTagFilter(disabledTags))

              if (onlyBookmarked) {
                events = events.filter(makeBookmarkFilter(selections))
              }

              const data = createICS(
                events,
                `schedule-${config.icalPrefix || "event"}`,
                config.icalDomain || window.location.hostname,
              )
              const blob = new Blob([data], { type: "text/calendar" })
              const dataURL = URL.createObjectURL(blob)
              const el = document.createElement("a")
              el.setAttribute("href", dataURL)
              el.setAttribute("download", `${config.id}-schedule.ics`)
              el.click()
              URL.revokeObjectURL(dataURL)
            }}
          >
            Export Calendar
          </Anchor>
        </Stack>
      </Grid.Col>
    </Grid>
  )
})

EventsRoute.displayName = "EventsRoute"

type ViewProps = {
  events: readonly Scheduled<Event>[]
  binMinutes?: number
  getIsBookmarked: (event: Event) => boolean
  setBookmarked: (event: Event, set: boolean) => void
  getBookmarkCount: (event: Event) => number | null | undefined
  getHref: (event: Event) => string
  onClickEvent: (e: MouseEvent, event: Event) => void
}

const PillsView = (props: ViewProps) => {
  const {
    events,
    binMinutes,
    getIsBookmarked,
    setBookmarked,
    getBookmarkCount,
    getHref,
    onClickEvent,
  } = props
  return (
    <EventPills
      events={events}
      binMinutes={binMinutes}
      getIsBookmarked={getIsBookmarked}
      setBookmarked={setBookmarked}
      getBookmarkCount={getBookmarkCount}
      getHref={getHref}
      onClickEvent={onClickEvent}
    />
  )
}

// const CalendarView = (
//   props: ViewProps & { direction?: "row" | "column"; rooms: readonly string[] }
// ) => {
//   const {
//     rooms,
//     events,
//     direction,
//     getIsBookmarked,
//     setBookmarked,
//     getHref,
//     onClickEvent,
//   } = props

//   const earliest = events[0]
//   const latest = events[events.length - 1]

//   const cols = rooms.map((r) => {
//     const roomEvents = events.filter((e) => e.location == r)
//     return {
//       title: r,
//       events: roomEvents,
//     }
//   })

//   return (
//     <Calendar
//       direction={direction}
//       start={earliest.start}
//       end={latest.end}
//       columns={cols}
//       getIsBookmarked={getIsBookmarked}
//       setBookmarked={setBookmarked}
//       getHref={getHref}
//       onClickEvent={onClickEvent}
//     />
//   )
// }
