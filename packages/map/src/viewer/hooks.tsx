import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react"
import type { SVGData } from "../svg/svg.js"
import type { MapLevel, MapLocation, MapObject } from "../types.js"
import { iterToArr } from "@open-event-systems/schedule-lib"
import { fetchMapSVG, isMapLevel } from "./util.js"
import type { ZoomFunc } from "../panzoom/panzoom.js"
import { mapSVGClassNames } from "../svg/classes.js"
import { MapViewer, type MapViewerLocationItemInfo } from "./map-viewer.js"
import {
  makeTransitionManager,
  type TransitionState,
} from "../svg/hooks/transition.js"
import { mapViewerClassNames } from "./classes.js"

type MapViewerHookOptions = Readonly<{
  objects: Iterable<MapObject>
  locations: Iterable<MapLocation>
  currentLevelId: string
  isometric?: boolean
  hiddenLayerIds?: Iterable<string>
  flags?: Iterable<string>
  locationItemInfo?: Iterable<MapViewerLocationItemInfo>
  activeLocationId?: string | null
  zoomLocationId?: string | null
  detailsLocationId?: string | null
  onSetActiveLocationId?: (id: string | null) => void
  onSetDetailsLocationId?: (id: string | null) => void
  onSetFlag?: (flag: string, enabled: boolean) => void
}>

export const useMapViewer = (
  rootEl: Element | null,
  zoomFunc: ZoomFunc | null,
  options: MapViewerHookOptions,
): Readonly<{
  ready: boolean
  levels: readonly MapLevel[]
  children: ReactNode[]
  handleZoom: (type: "in" | "out" | "reset") => void
  detailsLocation?: MapLocation
}> => {
  const {
    objects,
    locations,
    currentLevelId,
    isometric,
    hiddenLayerIds,
    flags,
    locationItemInfo,
    activeLocationId,
    zoomLocationId,
    detailsLocationId,
    onSetActiveLocationId,
    onSetDetailsLocationId,
    onSetFlag,
  } = options

  const { ready, svgDataMap } = useLoadSVGObjects(objects)

  const levels = useMemo(() => {
    return iterToArr(objects).filter(isMapLevel)
  }, [objects])

  const toggleFlag = useCallback(
    (flag: string) => {
      if (iterToArr(flags).includes(flag)) {
        onSetFlag && onSetFlag(flag, false)
      } else {
        onSetFlag && onSetFlag(flag, true)
      }
    },
    [flags, onSetFlag],
  )

  const objectEls = useMemo(() => {
    return iterToArr(objects).map((obj, i) => {
      const objSvg = svgDataMap?.get(obj.url)
      if (!objSvg) {
        return null
      }

      if (isMapLevel(obj)) {
        const active = currentLevelId == obj.id
        return (
          <MapViewer.Level
            key={`level-${obj.id}`}
            type={obj.type}
            levelId={obj.id}
            active={active}
            isometric={isometric && !obj.noIsometricTransform}
            svgData={objSvg}
            hiddenLayerIds={hiddenLayerIds}
            flags={flags}
            locationInfo={locationItemInfo}
            activeLocationId={activeLocationId}
            onToggleFlag={toggleFlag}
            onClickArea={(id) => {
              onSetActiveLocationId && onSetActiveLocationId(id)
              onSetDetailsLocationId && onSetDetailsLocationId(id)
            }}
          />
        )
      } else {
        return (
          <MapViewer.Object
            key={`obj-${i}`}
            type={obj.type}
            isometric={isometric && !obj.noIsometricTransform}
            svgData={objSvg}
            hiddenLayerIds={hiddenLayerIds}
            flags={flags}
            locationInfo={locationItemInfo}
            activeLocationId={activeLocationId}
            onClickArea={(id) => {
              onSetActiveLocationId && onSetActiveLocationId(id)
              onSetDetailsLocationId && onSetDetailsLocationId(id)
            }}
          />
        )
      }
    })
  }, [
    objects,
    svgDataMap,
    currentLevelId,
    isometric,
    hiddenLayerIds,
    flags,
    locationItemInfo,
    activeLocationId,
    toggleFlag,
    onSetActiveLocationId,
    onSetDetailsLocationId,
  ])

  const zoomLocation = useLocationEntry(locations, zoomLocationId)
  useAutoZoomToElement(zoomFunc, rootEl, zoomLocation)

  const handleZoom = useCallback(
    (type: "in" | "out" | "reset") => {
      zoomFunc && zoomFunc(type)
    },
    [zoomFunc],
  )

  const detailsLocation = useLocationEntry(locations, detailsLocationId)

  return {
    ready,
    handleZoom,
    levels,
    detailsLocation,
    children: objectEls,
  }
}

export const useLocationEntry = (
  locations: Iterable<MapLocation>,
  id?: string | null,
): MapLocation | undefined => {
  return useMemo(() => {
    return id != null
      ? iterToArr(locations).find((item) => item.id == id)
      : undefined
  }, [locations, id])
}

export const useAutoZoomToElement = (
  zoomFunc: ZoomFunc | null,
  rootEl: Element | null,
  location?: MapLocation | null,
) => {
  useEffect(() => {
    if (location && zoomFunc && rootEl) {
      const zoomAmt = location.zoomScale ?? 0.5

      const locCls = mapSVGClassNames.areaId(location.id)
      const els = rootEl.getElementsByClassName(locCls)
      for (const el of els) {
        const styles = window.getComputedStyle(el)
        if (
          styles.display != "none" &&
          (el instanceof HTMLElement || el instanceof SVGElement)
        ) {
          zoomFunc(el, zoomAmt)
          break
        }
      }
    }
  }, [location, rootEl, zoomFunc])
}

export const useLoadSVGObjects = (
  objects: Iterable<MapObject>,
): SVGLoadState => {
  const [loadState, dispatch] = useReducer(svgObjectReducer, {
    ready: false,
  })

  useEffect(() => {
    const urls = iterToArr(objects).map((o) => o.url)
    const promises = urls.map((url) =>
      fetchMapSVG(url).then((data) => [url, data] as const),
    )

    dispatch(() => ({ ready: false, objects }))

    Promise.all(promises).then((res) => {
      const resMap = new Map(res)
      dispatch((cur) => {
        if (!cur.objects || cur.objects === objects) {
          return { ready: true, objects, svgDataMap: resMap }
        } else {
          return cur
        }
      })
    })
  }, [dispatch, objects])

  return loadState
}

type SVGLoadState = Readonly<
  | {
      ready: true
      objects: Iterable<MapObject>
      svgDataMap: ReadonlyMap<string, SVGData>
    }
  | {
      ready: false
      objects?: Iterable<MapObject>
      svgDataMap?: ReadonlyMap<string, SVGData>
    }
>

const svgObjectReducer = (
  state: SVGLoadState,
  action: (cur: SVGLoadState) => SVGLoadState,
): SVGLoadState => {
  return {
    ...action(state),
  }
}

export const useIsometricTransition = (
  isometric = false,
): Readonly<{
  onTransitionEnd: () => void
  svgClassNames: readonly string[]
  wrapperClassNames: readonly string[]
}> => {
  const [transitionState, setTransitionState] = useState<TransitionState>(
    isometric ? "on" : "off",
  )

  const [[setIsometric, onTransitionEnd]] = useState(() =>
    makeTransitionManager(setTransitionState, isometric),
  )

  useEffect(() => {
    setIsometric(isometric)
  }, [setIsometric, isometric])

  const svgClassNames: string[] = []
  const wrapperClassNames: string[] = []

  if (transitionState == "on") {
    svgClassNames.push(mapSVGClassNames.isometricTransitionFinished)
  }

  if (transitionState == "on" || transitionState == "forward") {
    wrapperClassNames.push(mapViewerClassNames.objectIsometricTransform)
    svgClassNames.push(mapSVGClassNames.isometricTransform)
  }

  if (transitionState != "off" || isometric) {
    wrapperClassNames.push(mapViewerClassNames.objectIsometric)
    svgClassNames.push(mapSVGClassNames.isometric)
  }

  return { svgClassNames, wrapperClassNames, onTransitionEnd }
}
