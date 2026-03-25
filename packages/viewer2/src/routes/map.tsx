import {
  getCurrentMapLocationItems,
  getLaterMapLocationItems,
  getMapLocationInfo,
  MapViewer,
  useMapLocationMatchFunc,
  type MapConfig,
} from "@open-event-systems/schedule-map"
import { useViewerConfig } from "../config.js"

import { useEffect, useMemo, useRef, useState } from "react"
import { useItems } from "@open-event-systems/schedule-react"
import {
  makeItemNavPropsMap,
  makeRenderItemDetailsFunc,
  parsers,
} from "../schedule.js"
import { makeScheduleItemCollection } from "@open-event-systems/schedule-lib"
import { combineScheduleItems, useNow } from "../utils.js"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { mapRoute } from "../routes.js"
import { isMapLevel } from "../../../map/src/viewer/util.js"

import classes from "./map.module.scss"

declare module "@tanstack/react-router" {
  interface HistoryState {
    mapModalBack?: boolean
  }
}

export const MapRoute = () => {
  const config = useViewerConfig()
  const { map: mapCfg } = config

  if (!mapCfg) {
    throw new Error("Map not configured")
  }

  const [hiddenLayers, setHiddenLayers] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  )

  const router = useRouter()
  const context = mapRoute.useRouteContext()
  const navigate = useNavigate()

  const { iso: isometric } = mapRoute.useSearch()

  const now = useNow()

  const {
    byType: { event: events, vendor: vendors },
  } = useItems(parsers)

  const items = useMemo(() => {
    return makeScheduleItemCollection(combineScheduleItems(events, vendors))
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

  const { selectedLoc, levelId, activeLocationId, zoomLocationId } =
    useLocationIds(mapCfg)

  const [nowItem, laterItem] = useMemo(() => {
    return selectedLoc
      ? [nowItems.get(selectedLoc.id), laterItems.get(selectedLoc.id)]
      : []
  }, [selectedLoc?.id, nowItems, laterItems])

  const mapLocMatchFunc = useMapLocationMatchFunc(mapCfg.locations)
  const navPropsMap = useMemo(
    () =>
      makeItemNavPropsMap(
        router,
        router.origin ?? "",
        context.getCurrentURL(),
        mapLocMatchFunc,
        items,
      ),
    [router, router.origin, context.getCurrentURL, mapLocMatchFunc, items],
  )
  const renderItemDetailsFunc = useMemo(
    () => makeRenderItemDetailsFunc(navPropsMap),
    [navPropsMap],
  )

  return (
    <MapViewer
      className={classes.root}
      homeURL={config.homeURL}
      contentWidth={mapCfg.width}
      contentHeight={mapCfg.height}
      layers={mapCfg.layers}
      locations={mapCfg.locations}
      objects={mapCfg.objects}
      currentLevelId={levelId}
      activeLocationId={activeLocationId}
      detailsLocationId={selectedLoc?.id}
      zoomLocationId={zoomLocationId}
      locationItemInfo={locationItemInfo}
      isometric={isometric}
      hiddenLayers={hiddenLayers}
      nowDetails={
        nowItem ? renderItemDetailsFunc({ item: nowItem }) : undefined
      }
      laterDetails={
        laterItem ? renderItemDetailsFunc({ item: laterItem }) : undefined
      }
      onSetDetailsLocationId={(loc) => {
        if (loc) {
          navigate({
            to: mapRoute.to,
            search: (prev) => {
              return {
                ...prev,
                loc,
                level: undefined,
                show: undefined,
              }
            },
            state: {
              mapModalBack: true,
            },
          })
        } else {
          if (router.history.location.state.mapModalBack) {
            router.history.go(-1)
          } else if (selectedLoc) {
            navigate({
              to: mapRoute.to,
              search: (prev) => {
                return {
                  ...prev,
                  loc: undefined,
                  show: undefined,
                  level: selectedLoc.level,
                }
              },
            })
          } else if (activeLocationId) {
            navigate({
              to: mapRoute.to,
              search: (prev) => {
                return {
                  ...prev,
                  loc: undefined,
                  show: undefined,
                }
              },
              replace: true,
            })
          }
        }
      }}
      onSetLevelId={(id) => {
        navigate({
          to: mapRoute.to,
          search: (prev) => {
            return {
              ...prev,
              level: id,
              show: undefined,
            }
          },
          replace: true,
        })
      }}
      onSetHiddenLayers={(layers) => setHiddenLayers(new Set(layers))}
      onSetIsometric={(iso) => {
        navigate({
          to: mapRoute.to,
          search: (prev) => {
            return {
              ...prev,
              iso: iso || undefined,
            }
          },
          replace: true,
        })
      }}
    />
  )
}

const useLocationIds = (mapCfg: MapConfig) => {
  const firstRenderRef = useRef(true)

  useEffect(() => {
    firstRenderRef.current = false
  }, [])

  const {
    show: searchShowId,
    loc: searchLocId,
    level: searchLevelId,
    iso: isometric,
  } = mapRoute.useSearch()

  return useMemo(() => {
    const showLoc = searchShowId
      ? mapCfg.locations.find((l) => l.id == searchShowId)
      : undefined

    const selectedLoc = searchLocId
      ? mapCfg.locations.find((l) => l.id == searchLocId)
      : undefined

    let activeLocationId

    if (firstRenderRef.current && selectedLoc) {
      activeLocationId = selectedLoc.id
    } else if (!selectedLoc) {
      activeLocationId = showLoc?.id
    }

    const zoomLocationId = firstRenderRef.current ? activeLocationId : undefined

    const levelLoc = selectedLoc ?? showLoc

    let levelId

    if (levelLoc) {
      levelId = levelLoc.level
    } else if (searchLevelId) {
      const level = mapCfg.objects
        .filter(isMapLevel)
        .find((o) => o.id == searchLevelId)
      levelId = level?.id ?? mapCfg.defaultLevel
    } else {
      levelId = mapCfg.defaultLevel
    }

    return {
      selectedLoc,
      activeLocationId,
      zoomLocationId,
      levelId,
    }
  }, [mapCfg.locations, mapCfg.layers, searchLocId, searchLevelId, isometric])
}
