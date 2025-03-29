import {
  confirmSyncScheduleRoute,
  eventRoute,
  eventsDataRoute,
  eventsRoute,
  sharedScheduleRoute,
  shareScheduleRoute,
  syncScheduleRoute,
} from "./index.js"
import { Grid, SegmentedControl, Stack } from "@mantine/core"
import { DayFilterDay } from "@open-event-systems/schedule-components/day-filter/DayFilter"
import { MouseEvent, useCallback, useContext, useRef } from "react"
import {
  Event,
  isScheduled,
  makeBookmarkFilter,
  makeTagFilter,
  makeTitleFilter,
} from "@open-event-systems/schedule-lib"
import { Filter } from "@open-event-systems/schedule-components/filter/Filter"
import { ConfirmSyncDialog } from "@open-event-systems/schedule-components/confirm-sync-dialog/confirm-sync-dialog"
import { ShareDialog } from "@open-event-systems/schedule-components/share-dialog/share-dialog"
import { ShareMenu } from "@open-event-systems/schedule-components/share-menu/share-menu"
import { observer } from "mobx-react-lite"
import { useLocation, useMatch, useRouter } from "@tanstack/react-router"
import { useEvents } from "../schedule.js"
import {
  useBookmarkAPI,
  useBookmarkCounts,
  useBookmarks,
  useUpdateBookmarks,
} from "../bookmarks.js"
import { FilterContext } from "../components/App.js"
import { ScheduleView } from "../components/schedule-view.js"
import { createICS } from "../ical.js"

export const EventsRoute = observer(() => {
  const { config } = eventsDataRoute.useRouteContext()
  const allEvents = useEvents(config.events, config.timeZone)
  const selections = useBookmarks(config.id)
  const counts = useBookmarkCounts(config.id)
  const updateSelections = useUpdateBookmarks(config.id)
  const bookmarkAPI = useBookmarkAPI()

  const [filter, setFilter] = useContext(FilterContext)
  const { text: filterText, disabledTags, showPast, onlyBookmarked } = filter

  const loc = useLocation()
  const navigate = eventsRoute.useNavigate()
  const router = useRouter()

  // sharing
  const shareMatch = useMatch({
    from: shareScheduleRoute.id,
    shouldThrow: false,
  })
  const syncMatch = useMatch({
    from: syncScheduleRoute.id,
    shouldThrow: false,
  })
  const confirmSyncMatch = useMatch({
    from: confirmSyncScheduleRoute.id,
    shouldThrow: false,
  })

  const { shareId } = shareMatch?.loaderData ?? {}
  const { syncId } = syncMatch?.loaderData ?? {}
  const { syncId: confirmSyncId } = confirmSyncMatch?.params ?? {}
  const lastShareIdRef = useRef<string | undefined>(shareId)
  const lastSyncIdRef = useRef<string | undefined>(shareId)
  if (shareId) {
    lastShareIdRef.current = shareId
  }
  if (syncId) {
    lastSyncIdRef.current = syncId
  }
  const shareURL = router.buildLocation({
    to: sharedScheduleRoute.to,
    params: {
      selectionId: lastShareIdRef.current,
    },
  }).href
  const fullShareURL = new URL(
    router.history.createHref(shareURL),
    window.location.href,
  )
  const syncURL = router.buildLocation({
    to: confirmSyncScheduleRoute.to,
    params: {
      syncId: lastSyncIdRef.current,
    },
  }).href
  const fullSyncURL = new URL(
    router.history.createHref(syncURL),
    window.location.href,
  )

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
      return String(
        new URL(
          router.history.createHref(
            router.buildLocation({
              to: eventRoute.to,
              params: {
                eventId: event.id,
              },
            }).href,
          ),
          window.location.href,
        ),
      )
    },
    [router],
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
          <ScheduleView
            config={config}
            events={allEvents}
            filter={filter}
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
          <ShareMenu
            enableSync={!!bookmarkAPI}
            onShare={() => {
              navigate({
                to: shareScheduleRoute.to,
              })
            }}
            onSync={() => {
              navigate({
                to: syncScheduleRoute.to,
              })
            }}
            onExport={() => {
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
          />
          <ShareDialog
            type="share"
            opened={!!shareId}
            onClose={() => {
              router.history.go(-1)
            }}
            shareURL={String(fullShareURL)}
          />
          <ShareDialog
            type="sync"
            opened={!!syncId}
            onClose={() => {
              if (router.history.canGoBack()) {
                router.history.go(-1)
              } else {
                navigate({
                  to: eventsRoute.to,
                  replace: true,
                })
              }
            }}
            shareURL={String(fullSyncURL)}
          />
          <ConfirmSyncDialog
            opened={!!confirmSyncMatch}
            onConfirm={() => {
              if (confirmSyncId && bookmarkAPI) {
                const href = router.buildLocation({
                  to: eventsDataRoute.to,
                }).href
                const url = new URL(
                  router.history.createHref(href),
                  window.location.href,
                )
                bookmarkAPI.setup(confirmSyncId).then(() => {
                  window.location.href = String(url)
                  window.location.reload()
                })
              }
            }}
            onClose={() => {
              if (router.history.canGoBack()) {
                router.history.go(-1)
              } else {
                navigate({
                  to: eventsRoute.to,
                  replace: true,
                })
              }
            }}
          />
        </Stack>
      </Grid.Col>
    </Grid>
  )
})

EventsRoute.displayName = "EventsRoute"
