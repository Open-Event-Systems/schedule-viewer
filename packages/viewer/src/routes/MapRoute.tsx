import { MapViewer } from "@open-event-systems/schedule-map/viewer/MapViewer"
import { useMapConfig, useTime } from "../config.js"
import { useLocation, useRouter } from "@tanstack/react-router"
import { getMapLocations } from "@open-event-systems/schedule-map/map"
import { eventRoute, mapRoute } from "./index.js"
import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useEvents } from "../schedule.js"
import { useScheduleConfig } from "@open-event-systems/schedule-components/config/context"
import { MapEvent } from "@open-event-systems/schedule-map/types"

export const MapRoute = () => {
  const config = useScheduleConfig()
  const mapConfig = useMapConfig()

  const events = useEvents(config.events, config.timeZone)

  const loc = useLocation()
  const hashArgs = new URLSearchParams(loc.hash)
  const locId = hashArgs.get("loc")
  const now = useTime()

  const flags = new Set<string>(hashArgs.getAll("flag"))

  // hack: set the shown level to what we'll be zooming to. this requires us to
  // know the location info here instead of only in the viewer component
  const locations = useMemo(() => {
    return getMapLocations(mapConfig)
  }, [mapConfig])
  const selectedLoc = locId ? locations.get(locId) : undefined

  const [level, setLevel] = useState(
    selectedLoc?.level ?? mapConfig.defaultLevel,
  )

  const router = useRouter()
  const navigate = mapRoute.useNavigate()

  const [selectionId, setSelectionId] = useState<string | null>(null)
  const [zoomFunc, setZoomFunc] = useState<((id: string) => void) | null>(null)
  const firstLocId = useRef(locId)

  // workaround for passing a function to setState...
  const wrappedSetZoomFunc = useCallback(
    (zf: ((id: string) => void) | null) => {
      setZoomFunc(() => zf)
    },
    [setZoomFunc],
  )

  const setLevelCb = useCallback(
    (level: string) => {
      setLevel(level)
    },
    [setLevel],
  )

  useEffect(() => {
    if (zoomFunc && firstLocId.current) {
      zoomFunc(firstLocId.current)
      firstLocId.current = null
    }
  }, [zoomFunc])

  const getEventHref = useCallback(
    (event: MapEvent) => {
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

  const onClickEvent = useCallback(
    (e: MouseEvent, event: MapEvent) => {
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

  // best effort mobile detection
  const [isMobile] = useState(() =>
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
  )

  return (
    <MapViewer
      w="100%"
      h="100%"
      config={mapConfig}
      events={events}
      zoomFuncRef={wrappedSetZoomFunc}
      highlightId={locId}
      level={level}
      onSetLevel={setLevelCb}
      selectionId={selectionId}
      now={now}
      flags={flags}
      noIsometricTransition={isMobile}
      onClickEvent={onClickEvent}
      getEventHref={getEventHref}
      onSelectLocation={(loc) => {
        setSelectionId(loc)
        navigate({
          hash: loc ? `loc=${loc}` : undefined,
          replace: true,
        })
      }}
    />
  )
}
