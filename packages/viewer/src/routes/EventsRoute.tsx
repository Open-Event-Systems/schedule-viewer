import {
  confirmSyncScheduleRoute,
  dataRoute,
  eventsRoute,
  sharedScheduleRoute,
  shareScheduleRoute,
  syncScheduleRoute,
} from "./index.js"
import {
  Grid,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Text,
} from "@mantine/core"
import { useCallback, useRef, useState } from "react"
import {
  clearSelections,
  createICS,
  isBounded,
  setupBookmarkServiceAPI,
} from "@open-event-systems/schedule-lib"
import { ConfirmSyncDialog } from "@open-event-systems/schedule-react/components/confirm-sync-dialog/confirm-sync-dialog"
import { ShareDialog } from "@open-event-systems/schedule-react/components/share-dialog/share-dialog"
import { ShareMenu } from "@open-event-systems/schedule-react/components/share-menu/share-menu"
import { BookmarkFilter } from "@open-event-systems/schedule-react/components/bookmark-filter/bookmark-filter"
import { observer } from "mobx-react-lite"
import { useMatch, useRouter } from "@tanstack/react-router"
import {
  useFilter,
  useFilteredItems,
  useItems,
  useSelections,
} from "@open-event-systems/schedule-react"
import { useTime } from "../config.js"
import { useBookmarkServiceAPI } from "@open-event-systems/schedule-react"
import { Filter } from "../components/filter.js"
import { DailyAgendaView } from "../components/schedule/daily-agenda-view.js"
import { CatalogView } from "../components/schedule/catalog-view.js"
import { TagsView } from "../components/schedule/tags-view.js"

export const EventsRoute = observer(() => {
  const { config } = dataRoute.useRouteContext()
  const { events: allEvents } = useItems()
  const selections = useSelections()
  const bookmarkServiceAPI = useBookmarkServiceAPI()

  const [filter, updateFilter] = useFilter()
  const now = useTime()
  const filteredEvents = useFilteredItems(allEvents, now, selections)

  const [viewType, setViewType] = useState<string>("daily")

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
      selectionId: lastShareIdRef.current ?? "",
    },
  }).href
  const fullShareURL = new URL(
    router.history.createHref(shareURL),
    window.location.href,
  )
  const syncURL = router.buildLocation({
    to: confirmSyncScheduleRoute.to,
    params: {
      syncId: lastSyncIdRef.current ?? "",
    },
  }).href
  const fullSyncURL = new URL(
    router.history.createHref(syncURL),
    window.location.href,
  )

  return (
    <Grid>
      <Grid.Col span={{ xs: 12, sm: 8 }} order={{ base: 2, xs: 2, sm: 1 }}>
        <Stack>
          <Grid gutter="xs" justify="flex-start" align="baseline">
            <Grid.Col span={{ base: "content" }}>
              <Text component="label" size="xs" htmlFor="view-options">
                View:
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: "auto", sm: "content" }}>
              <ViewOptions view={viewType} setView={setViewType} />
            </Grid.Col>
          </Grid>
          {viewType == "catalog" && <CatalogView items={allEvents} />}
          {viewType == "daily" && (
            <DailyAgendaView
              items={allEvents}
              curRoute={{ to: eventsRoute.to }}
            />
          )}
          {viewType == "tags" && <TagsView items={allEvents} />}
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ xs: 12, sm: 4 }} order={{ base: 1, xs: 1, sm: 2 }}>
        <Stack align="end" gap="xs">
          <BookmarkFilter
            value={filter.onlyBookmarked}
            fullWidth
            onChange={useCallback((v: boolean) => {
              updateFilter({ onlyBookmarked: v })
            }, [])}
            size="xs"
          />
          <Filter tags={config.tags} tagIndicators={config.tagIndicators} />
          <ShareMenu
            enableSync={!!bookmarkServiceAPI}
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
              const data = createICS(
                filteredEvents.filter(isBounded),
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
              if (confirmSyncId && config.bookmarks) {
                const href = router.buildLocation({
                  to: dataRoute.to,
                }).href
                const url = new URL(
                  router.history.createHref(href),
                  window.location.href,
                )
                setupBookmarkServiceAPI(config.bookmarks, confirmSyncId).then(
                  () => {
                    clearSelections(config.id)
                    window.location.href = String(url)

                    // only reload if using hash history
                    // checking for this global here is hacky...
                    if (scheduleRouter == "hash") {
                      window.location.reload()
                    }
                  },
                )
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

const ViewOptions = ({
  view,
  setView,
}: {
  view?: string
  setView: (view: string) => void
}) => {
  return (
    <Select
      id="view-options"
      variant="unstyled"
      data={[
        {
          label: "Daily Agenda",
          value: "daily",
        },
        {
          label: "Full Agenda",
          value: "agenda",
        },
        {
          label: "Catalog",
          value: "catalog",
        },
        {
          label: "By Tags",
          value: "tags",
        },
      ]}
      value={view || "daily"}
      onChange={(v) => setView(v || "daily")}
      allowDeselect={false}
      size="xs"
    />
  )
}
