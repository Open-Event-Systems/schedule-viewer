import { useScheduleConfig } from "@open-event-systems/schedule-components/config/context"
import { MapViewer } from "@open-event-systems/schedule-map/viewer/MapViewer"
import { DEFAULT_MAP_CONFIG, useMapConfig } from "../config.js"
import { useState } from "react"

export const MapRoute = () => {
  const mapConfig = useMapConfig()
  const [level, setLevel] = useState<string>(mapConfig.defaultLevel)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [selectionId, setSelectionId] = useState<string | null>(null)

  return (
    <MapViewer
      w="100%"
      h="100%"
      config={mapConfig}
      highlightId={highlightId}
      level={level}
      onSetLevel={(newLevel) => setLevel(newLevel)}
      selectionId={selectionId}
      onSelectLocation={(loc) => {
        setHighlightId(loc)
        setSelectionId(loc)
      }}
    />
  )
}
