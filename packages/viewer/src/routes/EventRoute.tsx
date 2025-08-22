import { EventDetails } from "@open-event-systems/schedule-react/components/details/event-details"
import { eventRoute, eventsRoute, mapRoute } from "./index.js"
import { Link, useRouter } from "@tanstack/react-router"
import { Anchor } from "@mantine/core"
import { observer } from "mobx-react-lite"
import { useCallback, useMemo } from "react"
import {
  useBookmarkCount,
  useSelections,
  useSetSelections,
} from "@open-event-systems/schedule-react/hooks"
import { useMapConfig } from "../config.js"
import { getMapLocationsWithAlias } from "@open-event-systems/schedule-map/map"
import { makeSelections } from "@open-event-systems/schedule-lib"

export const EventRoute = observer(() => {
  const mapConfig = useMapConfig()
  const { event } = eventRoute.useLoaderData()
  const selections = useSelections()
  const updateSelections = useSetSelections()
  const count = useBookmarkCount(event.id)
  const navigate = eventRoute.useNavigate()
  const router = useRouter()

  const mapLocs = useMemo(() => {
    return getMapLocationsWithAlias(mapConfig)
  }, [mapConfig])
  const mapLoc = event.location ? mapLocs.get(event.location) : undefined

  const locHref = mapLoc
    ? String(
        new URL(
          router.history.createHref(
            router.buildLocation({
              to: mapRoute.to,
              hash: `loc=${mapLoc.id}`,
            }).href,
          ),
          window.location.href,
        ),
      )
    : undefined

  const onClickLoc = mapLoc
    ? () => {
        navigate({
          to: mapRoute.to,
          hash: `loc=${mapLoc.id}`,
        })
      }
    : undefined

  const bookmarked = selections.events.has(event.id)
  const setBookmarked = useCallback(
    (set: boolean) => {
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
      updateSelections(newSelections)
    },
    [selections, updateSelections],
  )

  return (
    <>
      <Anchor component={Link} to={eventsRoute.to} size="sm">
        &laquo; Back to schedule
      </Anchor>
      <EventDetails
        key={event.id}
        large
        event={event}
        bookmarked={bookmarked}
        setBookmarked={setBookmarked}
        bookmarkCount={count}
        showShare
        locationHref={locHref}
        onClickLocation={onClickLoc}
        url={String(
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
        )}
      />
    </>
  )
})

EventRoute.displayName = "EventRoute"
