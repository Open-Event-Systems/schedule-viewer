import { MapViewer } from "@open-event-systems/schedule-map/viewer/MapViewer"
import { useMapConfig, useTime } from "../config.js"
import { useLocation } from "@tanstack/react-router"
import { getMapLocations } from "@open-event-systems/schedule-map/map"
import { mapRoute } from "./index.js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export const MapRoute = () => {
  const mapConfig = useMapConfig()

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

  return (
    <MapViewer
      w="100%"
      h="100%"
      config={mapConfig}
      zoomFuncRef={wrappedSetZoomFunc}
      highlightId={locId}
      level={level}
      onSetLevel={setLevelCb}
      selectionId={selectionId}
      now={now}
      flags={flags}
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
