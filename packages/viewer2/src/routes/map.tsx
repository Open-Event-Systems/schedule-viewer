import {
  getCurrentMapLocationItems,
  getLaterMapLocationItems,
  getMapLocationInfo,
  MapViewer,
  useMapLocationMatchFunc,
  type MapConfig,
  type MapViewerSettings,
} from "@open-event-systems/schedule-map"
import { useViewerConfig } from "../config.js"

import "@open-event-systems/schedule-map/schedule-map.css"
import classes from "./map.module.scss"
import { useEffect, useMemo, useReducer, useRef } from "react"
import { useItems } from "@open-event-systems/schedule-react"
import { parsers } from "../schedule.js"
import { makeScheduleItemCollection } from "@open-event-systems/schedule-lib"
import { useNow } from "../utils.js"
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router"

declare module "@tanstack/react-router" {
  interface HistoryState {
    detailsLocationId?: string
  }
}

export const MapRoute = () => {
  const config = useViewerConfig()
  const { map: mapCfg } = config

  if (!mapCfg) {
    throw new Error("Map not configured")
  }

  const router = useRouter()
  const navigate = useNavigate()
  const loc = useLocation()

  const now = useNow()

  const firstRenderRef = useRef(true)

  useEffect(() => {
    firstRenderRef.current = false
  }, [])

  const {
    byType: { event: events, vendor: vendors },
  } = useItems(parsers)

  const items = useMemo(() => {
    const itemsGen = function* () {
      for (const iter of [events, vendors]) {
        for (const item of iter) {
          if (item.location) {
            yield item
          }
        }
      }
    }

    return makeScheduleItemCollection(itemsGen())
  }, [now, events, vendors])

  const locMatchFunc = useMapLocationMatchFunc(mapCfg.locations)

  const nowItems = useMemo(() => {
    return getCurrentMapLocationItems(items, locMatchFunc, now)
  }, [items, locMatchFunc, now])

  const laterItems = useMemo(() => {
    return getLaterMapLocationItems(items, locMatchFunc, now, 2)
  }, [items, locMatchFunc, now])

  const locationItemInfo = useMemo(
    () => getMapLocationInfo(nowItems.values(), locMatchFunc),
    [nowItems, locMatchFunc],
  )

  const { defaultLevelId, selectedLoc } = useLocationIds(mapCfg)

  const [settings, updateSettings] = useReducer(
    (prev: MapViewerSettings, action: Partial<MapViewerSettings>) => {
      return {
        ...prev,
        ...action,
      }
    },
    {
      currentLevelId: defaultLevelId,
    },
  )

  const [nowItem, laterItem] = useMemo(() => {
    return selectedLoc
      ? [nowItems.get(selectedLoc.id), laterItems.get(selectedLoc.id)]
      : []
  }, [selectedLoc?.id, nowItems, laterItems])

  return (
    <MapViewer
      className={classes.root}
      contentWidth={mapCfg.width}
      contentHeight={mapCfg.height}
      layers={mapCfg.layers}
      locations={mapCfg.locations}
      objects={mapCfg.objects}
      {...settings}
      activeLocationId={selectedLoc?.id}
      detailsLocationId={loc.state.detailsLocationId}
      zoomLocationId={
        firstRenderRef.current && selectedLoc?.id ? selectedLoc.id : undefined
      }
      locationItemInfo={locationItemInfo}
      // nowDetails={nowItem ? renderItemDetails({ item: nowItem }) : undefined}
      // laterDetails={
      //   laterItem ? renderItemDetails({ item: laterItem }) : undefined
      // }
      onSetActiveLocationId={(loc) => {
        // hack to remove current loc from url when deselecting
        if (
          !loc &&
          selectedLoc?.id &&
          !router.state.location.state.detailsLocationId
        ) {
          navigate({
            replace: true,
          })
        }
      }}
      onSetDetailsLocationId={(loc) => {
        if (loc) {
          navigate({
            hash: `loc=${loc}`,
            state: {
              detailsLocationId: loc,
            },
          })
        } else {
          // hack to prevent going back multiple times if clicking rapidly
          if (router.state.location.state.detailsLocationId) {
            router.history.go(-1)
          }
        }
      }}
      onSetLevelId={(loc) => updateSettings({ currentLevelId: loc })}
      onSetHiddenLayers={(layers) => updateSettings({ hiddenLayers: layers })}
      onSetIsometric={(iso) => updateSettings({ isometric: iso })}
    />
  )
}

const useLocationIds = (mapCfg: MapConfig) => {
  const loc = useLocation()
  const hashParams = new URLSearchParams(loc.hash)
  const selectedLocId = hashParams.get("loc")

  return useMemo(() => {
    const selectedLoc = selectedLocId
      ? mapCfg.locations.find((l) => l.id == selectedLocId)
      : undefined

    return {
      selectedLoc,
      defaultLevelId: selectedLoc?.level ?? mapCfg.defaultLevel,
    }
  }, [mapCfg.locations, mapCfg.defaultLevel, selectedLocId])
}
