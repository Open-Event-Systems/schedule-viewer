import { useScheduleConfig } from "@open-event-systems/schedule-components/config/context"
import { MapViewer } from "@open-event-systems/schedule-map/viewer/MapViewer"
import { DEFAULT_MAP_CONFIG } from "../config.js"

export const MapRoute = () => {
  const scheduleConfig = useScheduleConfig()
  const mapConfig = { ...DEFAULT_MAP_CONFIG, ...scheduleConfig.map }

  return <MapViewer config={mapConfig} />
}
