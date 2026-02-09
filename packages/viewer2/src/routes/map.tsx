import {
  MapViewer,
  useMapLocationMatchFunc,
  type MapLocationMatchFunc,
  type MapViewerLocationItemInfo,
  type MapViewerSettings,
} from "@open-event-systems/schedule-map"
import { useViewerConfig } from "../config.js"

import "@open-event-systems/schedule-map/schedule-map.css"
import classes from "./map.module.scss"
import { useEffect, useMemo, useReducer, useRef } from "react"
import { isMapLevel } from "../../../map/src/viewer/util.js"
import {
  useItems,
  type ItemDetailsItemType,
} from "@open-event-systems/schedule-react"
import {
  CachedItemPropsContext,
  makeCachedItemPropsMap,
  parsers,
  useRenderItemDetailsFunc,
} from "../schedule.js"
import { contains, ScheduleItemStore } from "@open-event-systems/schedule-lib"
import { add, isEqual } from "date-fns"
import { useNow } from "../utils.js"
import { useLocation, useRouter } from "@tanstack/react-router"

export const MapRoute = () => {
  const config = useViewerConfig()
  const { map: mapCfg } = config

  if (!mapCfg) {
    return
  }

  const router = useRouter()
  const loc = useLocation()
  const hashParams = new URLSearchParams(loc.hash)
  const mapLocId = hashParams.get("loc")

  const now = useNow()

  const firstRenderRef = useRef(true)

  useEffect(() => {
    firstRenderRef.current = false
  }, [])

  const allItems = useItems(parsers)

  const items = useMemo(() => {
    const itemsGen = function* () {
      for (const item of allItems.event) {
        if (item.location) {
          yield item
        }
      }

      for (const item of allItems.vendor) {
        if (item.location) {
          yield item
        }
      }
    }

    return new ScheduleItemStore(itemsGen())
  }, [now, allItems])

  const nowItems = useMemo(() => {
    return getCurrentItems(items, now)
  }, [items, now])

  const laterItems = useMemo(() => {
    return getLaterItems(items, now)
  }, [items, now])

  const matchFunc = useMapLocationMatchFunc(mapCfg.locations)

  const locationItemInfo = useMemo(
    () => getLocationItemInfo(nowItems, matchFunc),
    [nowItems, matchFunc],
  )

  const selectedLoc = mapLocId
    ? mapCfg.locations.find((l) => l.id == mapLocId)
    : undefined
  const selectedLocLevel = selectedLoc?.level

  const defaultLevelId =
    selectedLocLevel ?? mapCfg?.objects.find((o) => isMapLevel(o))?.id ?? ""

  const [settings, updateSettings] = useReducer(
    (prev: MapViewerSettings, action: Partial<MapViewerSettings>) => {
      return {
        ...prev,
        ...action,
      }
    },
    {
      currentLevelId: defaultLevelId,
      activeLocationId: selectedLoc?.id,
    },
  )

  const { detailsLocationId } = settings

  const [nowItem, laterItem] = useMemo(
    () =>
      getNowAndLaterItems(detailsLocationId, matchFunc, nowItems, laterItems),
    [detailsLocationId, matchFunc, nowItems, laterItems],
  )

  const detailsPropsCache = makeCachedItemPropsMap(
    router,
    [nowItem, laterItem].filter((v) => !!v),
    config.tagIndicators,
    mapCfg.locations,
  )

  const renderItemDetails = useRenderItemDetailsFunc()

  return (
    <CachedItemPropsContext value={detailsPropsCache}>
      <MapViewer
        className={classes.root}
        contentWidth={mapCfg.width}
        contentHeight={mapCfg.height}
        layers={mapCfg.layers}
        locations={mapCfg.locations}
        objects={mapCfg.objects}
        {...settings}
        zoomLocationId={
          firstRenderRef.current && settings.activeLocationId
            ? settings.activeLocationId
            : undefined
        }
        locationItemInfo={locationItemInfo}
        nowDetails={nowItem ? renderItemDetails({ item: nowItem }) : undefined}
        laterDetails={
          laterItem ? renderItemDetails({ item: laterItem }) : undefined
        }
        onSetActiveLocationId={(loc) =>
          updateSettings({ activeLocationId: loc })
        }
        onSetDetailsLocationId={(loc) =>
          updateSettings({ detailsLocationId: loc })
        }
        onSetLevelId={(loc) => updateSettings({ currentLevelId: loc })}
        onSetHiddenLayers={(layers) => updateSettings({ hiddenLayers: layers })}
        onSetIsometric={(iso) => updateSettings({ isometric: iso })}
      />
    </CachedItemPropsContext>
  )
}

const getCurrentItems = <T extends ItemDetailsItemType>(
  items: ScheduleItemStore<T>,
  now: Date,
): ScheduleItemStore<T> => {
  return items.filter((it) => contains(it, now))
}

const getLaterItems = <T extends ItemDetailsItemType>(
  items: ScheduleItemStore<T>,
  now: Date,
): ScheduleItemStore<T> => {
  const later = add(now, { hours: 2 })
  const laterRange = { start: now, end: later }
  return items.filter(
    (it) =>
      !!it.start &&
      contains(laterRange, it.start) &&
      !isEqual(it.start, laterRange.start),
  )
}

const getLocationItemInfo = <T extends ItemDetailsItemType>(
  items: ScheduleItemStore<T>,
  matchFunc: MapLocationMatchFunc,
): MapViewerLocationItemInfo[] => {
  const results: MapViewerLocationItemInfo[] = []

  for (const item of items) {
    if (item.location) {
      const loc = matchFunc(item.location)
      if (loc) {
        results.push({
          id: loc.id,
          title: item.title,
          icon:
            "icon" in item && typeof item.icon == "string"
              ? item.icon
              : undefined,
        })
      }
    }
  }

  return results
}

const getNowAndLaterItems = <T extends ItemDetailsItemType>(
  locId: string | undefined,
  matchFunc: MapLocationMatchFunc,
  nowItems: ScheduleItemStore<T>,
  laterItems: ScheduleItemStore<T>,
): [T | undefined, T | undefined] => {
  if (!locId) {
    return [undefined, undefined]
  }

  let nowItem
  let laterItem

  for (const item of nowItems) {
    if (!item.location) {
      continue
    }

    const loc = matchFunc(item.location)
    if (loc && loc.id == locId) {
      nowItem = item
    }
  }

  for (const item of laterItems) {
    if (!item.location) {
      continue
    }

    const loc = matchFunc(item.location)
    if (loc && loc.id == locId) {
      laterItem = item
    }
  }

  return [nowItem, laterItem]
}
