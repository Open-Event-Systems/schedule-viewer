import { eventRoute, eventsDataRoute, sharedScheduleRoute } from "./index.js"
import { Anchor, Grid, Stack, Title } from "@mantine/core"
import { DayFilterDay } from "@open-event-systems/schedule-components/day-filter/DayFilter"
import { MouseEvent, useCallback, useContext } from "react"
import {
  Event,
  isScheduled,
  makeTagFilter,
  makeTitleFilter,
} from "@open-event-systems/schedule-lib"
import { Filter } from "@open-event-systems/schedule-components/filter/Filter"
import { observer } from "mobx-react-lite"
import { createICS } from "../ical.js"
import { notFound, useLocation, useRouter } from "@tanstack/react-router"
import { makeBookmarkFilter } from "@open-event-systems/schedule-lib"
import { useEvents } from "../schedule.js"
import {
  useBookmarkCounts,
  useBookmarksById,
  useUpdateBookmarks,
} from "../bookmarks.js"
import { FilterContext } from "../components/App.js"
import { ScheduleView } from "../components/schedule-view.js"

export const SharedScheduleRoute = observer(() => {
  const { config } = eventsDataRoute.useRouteContext()
  const { selectionId } = sharedScheduleRoute.useParams()
  const allEvents = useEvents(config.events, config.timeZone)
  const selections = useBookmarksById(config.id, selectionId)
  if (!selections) {
    throw notFound()
  }
  const counts = useBookmarkCounts(config.id)
  const updateSelections = useUpdateBookmarks(config.id)

  const [filter, setFilter] = useContext(FilterContext)
  const { text: filterText, disabledTags, showPast, onlyBookmarked } = filter

  const loc = useLocation()
  const navigate = sharedScheduleRoute.useNavigate()
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

  return (
    <Grid>
      <Grid.Col span={{ xs: 12, sm: 8 }} order={{ base: 2, xs: 2, sm: 1 }}>
        <Stack>
          <Title order={2} ta="center">
            Shared Schedule
          </Title>
          <ScheduleView
            config={config}
            events={allEvents}
            filter={{ ...filter, onlyBookmarked: true }}
            counts={counts}
            selectedDay={selectedDayKey}
            setSelectedDay={setSelectedDay}
            selections={selections}
            updateSelections={updateSelections}
            onClickEvent={onClick}
            getHref={getHref}
          />
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ xs: 12, sm: 4 }} order={{ base: 1, xs: 1, sm: 2 }}>
        <Stack align="end" gap="xs">
          <Filter
            text={filterText}
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

SharedScheduleRoute.displayName = "EventsRoute"

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
