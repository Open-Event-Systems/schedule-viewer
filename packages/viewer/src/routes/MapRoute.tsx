import { MapViewer } from "@open-event-systems/schedule-map/viewer/map-viewer"
import { useMapConfig, useTime, useViewerConfig } from "../config.js"
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
import { MapEvent } from "@open-event-systems/schedule-map/types"
import { useEvents } from "@open-event-systems/schedule-react"

export const MapRoute = () => {
  const config = useViewerConfig()
  const mapConfig = useMapConfig()

  const events = useEvents()

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

  return (
    <MapViewer
      w="100%"
      h="100%"
      config={mapConfig}
      homeURL={config.homeURL}
      events={events}
      zoomFuncRef={wrappedSetZoomFunc}
      highlightId={locId}
      level={level}
      onSetLevel={setLevelCb}
      selectionId={selectionId}
      now={now}
      flags={flags}
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
