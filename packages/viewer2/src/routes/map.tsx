import {
  getCurrentMapLocationItems,
  getLaterMapLocationItems,
  getMapLocationInfo,
  MapViewer,
  useMapLocationMatchFunc,
  type MapConfig,
} from "@open-event-systems/schedule-map"
import { useViewerConfig } from "../config.js"

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  getItemDetailsProps,
  useItems,
} from "@open-event-systems/schedule-react"
import {
  makeItemNavPropsMap,
  makeItemsByIdMap,
  makeRenderItemDetailsFunc,
  parsers,
} from "../schedule.js"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { mapRoute } from "../routes.js"
import { isMapLevel } from "../../../map/src/viewer/util.js"

import classes from "./map.module.scss"
import { useNow } from "../utils.js"
import { contains } from "@open-event-systems/schedule-lib"

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

  const router = useRouter()
  const context = mapRoute.useRouteContext()
  const navigate = useNavigate()

  const { iso: isometric, flag: searchFlags } = mapRoute.useSearch()

  const now = useNow()

  const { items } = useItems(parsers)
  const eventsAndVendors = useMemo(
    () => items.filter((t) => t.type == "event" || t.type == "vendor"),
    [items],
  )

  // Layer visibility
  const [hiddenLayers, setHiddenLayers] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  )

  const setLayerVisible = useCallback(
    (layer: string, visible: boolean) => {
      setHiddenLayers((cur) => {
        const newSet = new Set(cur)
        if (visible) {
          newSet.delete(layer)
        } else {
          newSet.add(layer)
        }
        return newSet
      })
    },
    [setHiddenLayers],
  )

  // Now/later items

  const locMatchFunc = useMapLocationMatchFunc(mapCfg.locations)

  const nowItems = useMemo(() => {
    return getCurrentMapLocationItems(eventsAndVendors, locMatchFunc, now)
  }, [eventsAndVendors, locMatchFunc, now])

  const laterItems = useMemo(() => {
    return getLaterMapLocationItems(eventsAndVendors, locMatchFunc, now, 2)
  }, [eventsAndVendors, locMatchFunc, now])

  const locationItemInfo = useMemo(
    () => getMapLocationInfo(nowItems.values(), locMatchFunc),
    [nowItems, locMatchFunc],
  )

  const { selectedLoc, level, activeLoc, zoomLocation } = useLocations(mapCfg)

  // Flags

  const initialCurrentMapFlags = useMemo(
    () =>
      items.filter((t) => t.type == "map-flag").filter((t) => contains(t, now)),
    [items, now],
  )

  const initialFullFlags = useMemo(() => {
    return [...(searchFlags ?? []), ...initialCurrentMapFlags.map((f) => f.id)]
  }, [searchFlags, initialCurrentMapFlags])

  const [enabledFlags, setEnabledFlags] = useState<ReadonlySet<string>>(() => {
    const set = new Set(initialFullFlags)

    zoomLocation?.requireFlags.forEach((l) => set.add(l))
    zoomLocation?.excludeFlags.forEach((l) => set.delete(l))

    return set
  })

  const onSetFlag = useCallback(
    (flag: string, enable: boolean) => {
      setEnabledFlags((cur) => {
        const newSet = new Set(cur)
        if (enable) {
          newSet.add(flag)
        } else {
          newSet.delete(flag)
        }
        return newSet
      })
    },
    [setEnabledFlags],
  )

  const [nowItem, laterItem] = useMemo(() => {
    return selectedLoc
      ? [nowItems.get(selectedLoc.id), laterItems.get(selectedLoc.id)]
      : []
  }, [selectedLoc?.id, nowItems, laterItems])

  // Render funcs

  const mapLocMatchFunc = useMapLocationMatchFunc(mapCfg.locations)
  const navPropsMap = useMemo(
    () =>
      makeItemNavPropsMap(
        router,
        context.getCurrentURL,
        mapLocMatchFunc,
        eventsAndVendors,
      ),
    [router, context.getCurrentURL, mapLocMatchFunc, items],
  )
  const itemsByIdMap = useMemo(
    () => makeItemsByIdMap(eventsAndVendors),
    [eventsAndVendors],
  )
  const renderItemDetailsFunc = useMemo(
    () => makeRenderItemDetailsFunc(navPropsMap, itemsByIdMap),
    [navPropsMap, itemsByIdMap],
  )

  return (
    <>
      <MapViewer
        className={classes.root}
        homeURL={config.homeURL}
        contentWidth={mapCfg.width}
        contentHeight={mapCfg.height}
        layers={mapCfg.layers}
        locations={mapCfg.locations}
        objects={mapCfg.objects}
        currentLevelId={level?.id || ""}
        activeLocationId={activeLoc?.id}
        detailsLocationId={selectedLoc?.id}
        zoomLocationId={zoomLocation?.id}
        locationItemInfo={locationItemInfo}
        flags={enabledFlags}
        flagToggles={mapCfg.flagToggles}
        isometric={isometric}
        hiddenLayerIds={hiddenLayers}
        nowDetails={
          nowItem
            ? renderItemDetailsFunc({ ...getItemDetailsProps(nowItem) })
            : undefined
        }
        laterDetails={
          laterItem
            ? renderItemDetailsFunc({ ...getItemDetailsProps(laterItem) })
            : undefined
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
            } else if (activeLoc) {
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
        onSetFlag={onSetFlag}
        onSetLayerVisible={setLayerVisible}
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
      <Suspense>
        <LazyNotifications />
      </Suspense>
    </>
  )
}

const LazyNotifications = lazy(() =>
  import("@mantine/notifications").then(({ Notifications }) => ({
    default: Notifications,
  })),
)

const useLocations = (mapCfg: MapConfig) => {
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

    const defaultLevel = mapCfg.objects
      .filter(isMapLevel)
      .find((o) => o.id == mapCfg.defaultLevel)

    let level

    if (levelLoc) {
      level =
        mapCfg.objects.filter(isMapLevel).find((o) => o.id == levelLoc.level) ??
        defaultLevel
    } else if (searchLevelId) {
      level =
        mapCfg.objects.filter(isMapLevel).find((o) => o.id == searchLevelId) ??
        defaultLevel
    } else {
      level = defaultLevel
    }

    return {
      selectedLoc,
      activeLoc: activeLocationId
        ? mapCfg.locations.find((loc) => loc.id == activeLocationId)
        : undefined,
      zoomLocation: zoomLocationId
        ? mapCfg.locations.find((loc) => loc.id == zoomLocationId)
        : undefined,
      level,
    }
  }, [mapCfg.locations, mapCfg.layers, searchLocId, searchLevelId, isometric])
}
