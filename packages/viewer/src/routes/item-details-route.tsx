import {
  makeSelections,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import {
  ItemDetailsProvider,
  makeItemDetailsFunc,
} from "@open-event-systems/schedule-react/components/details/context"
import { Outlet, useNavigate, useRouter } from "@tanstack/react-router"
import { useMemo } from "react"
import { eventRoute, mapRoute } from "./index.js"
import {
  useBookmarkCounts,
  useScheduleConfig,
  useSelections,
  useSetSelections,
} from "@open-event-systems/schedule-react"
import { useMapConfig } from "../config.js"
import { getMapLocationsWithAlias } from "@open-event-systems/schedule-map/map"

export const ItemDetailsRoute = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const counts = useBookmarkCounts()
  const selections = useSelections()
  const setSelections = useSetSelections()

  const config = useScheduleConfig()
  const mapConfig = useMapConfig()

  const mapLocs = useMemo(() => {
    return getMapLocationsWithAlias(mapConfig)
  }, [mapConfig])

  const detailsFunc = useMemo(
    () =>
      makeItemDetailsFunc({
        getHref(item: ScheduleItem) {
          const href = router.history.createHref(
            router.buildLocation({
              to: eventRoute.to,
              params: {
                eventId: item.id,
              },
            }).href,
          )
          return String(new URL(href, window.location.href))
        },
        onClickItem(e, item) {
          e.preventDefault()
          navigate({
            to: eventRoute.to,
            params: {
              eventId: item.id,
            },
          })
        },
        getBookmarkCount(item) {
          return counts?.get(item.id)
        },
        getIsBookmarked(item) {
          return selections.events.has(item.id)
        },
        getLocationHref(item) {
          const loc = item.location ? mapLocs.get(item.location) : undefined
          if (loc) {
            return String(
              new URL(
                router.history.createHref(
                  router.buildLocation({
                    to: mapRoute.to,
                    hash: `loc=${loc.id}`,
                  }).href,
                ),
                window.location.href,
              ),
            )
          }
          return undefined
        },
        onClickLocation(e, item) {
          e.preventDefault()
          const loc = item.location ? mapLocs.get(item.location) : undefined
          if (loc) {
            navigate({
              to: mapRoute.to,
              hash: `loc=${loc.id}`,
            })
          }
        },
        setBookmarked(item, set) {
          let newSels
          if (set) {
            newSels = makeSelections([...selections.events, item.id])
          } else {
            newSels = makeSelections(
              [...selections.events].filter((ev) => ev != item.id),
            )
          }
          setSelections(newSels)
        },
        tags: config.tags,
      }),
    [router, navigate, counts, selections, mapLocs, setSelections, config.tags],
  )

  return (
    <ItemDetailsProvider value={detailsFunc}>
      <Outlet />
    </ItemDetailsProvider>
  )
}
