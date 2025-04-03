import { useScheduleConfig } from "@open-event-systems/schedule-components/config/context"
import { MapViewer } from "@open-event-systems/schedule-map/viewer/MapViewer"
import { DEFAULT_MAP_CONFIG, useMapConfig } from "../config.js"
import { useState } from "react"
import { useLocation } from "@tanstack/react-router"
import { useEffect } from "react"
import { useRef } from "react"
import { useCallback } from "react"
import { useMemo } from "react"
import { getMapLocations } from "@open-event-systems/schedule-map/map"
import { mapRoute } from "./index.js"

export const MapRoute = () => {
  const mapConfig = useMapConfig()

  const loc = useLocation()
  const hashArgs = new URLSearchParams(loc.hash)
  const locId = hashArgs.get("loc")

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
