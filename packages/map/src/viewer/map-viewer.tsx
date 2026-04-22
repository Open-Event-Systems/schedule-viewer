import {
  ActionIcon,
  Box,
  type BoxProps,
  Loader,
  type LoaderProps,
  useProps,
} from "@mantine/core"
import { parseSVGData, type SVGData } from "../svg/svg.js"
import {
  forwardRef,
  memo,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { MapSVG } from "../svg/map-svg.js"
import clsx from "clsx"
import { mapViewerClassNames } from "./classes.js"
import { ZoomMenu, type ZoomMenuProps } from "../zoom-menu/zoom-menu.js"
import { LevelMenu, type LevelMenuProps } from "../level-menu/level-menu.js"
import { ToggleMenu, type ToggleMenuProps } from "../toggle-menu/toggle-menu.js"
import {
  PanZoom,
  type PanZoomProps,
  type ZoomFunc,
} from "../panzoom/panzoom.js"
import { IconCube } from "@tabler/icons-react"
import { isMapLevel, useIsometricTransition } from "./util.js"
import { mapSVGClassNames } from "../svg/classes.js"
import type {
  MapFlagToggle,
  MapLayer,
  MapLocation,
  MapObject,
} from "../types.js"
import {
  MapDetails,
  type MapDetailsDrawerProps,
  type MapDetailsProps,
} from "../details/map-details.js"

import classes from "./map-viewer.module.scss"
import "./map.scss"
import { iterToArr } from "@open-event-systems/schedule-lib"

export type MapViewerLocationItemInfo = Readonly<{
  id: string
  title?: string
  icon?: string
}>

export type MapViewerConfig = {
  objects: Iterable<MapObject>
  layers: Iterable<MapLayer>
  locations: Iterable<MapLocation>
  flagToggles: Iterable<MapFlagToggle>
  contentWidth: number
  contentHeight: number
}

export type MapViewerSettings = {
  currentLevelId: string
  homeURL?: string
  isometric?: boolean
  zoomFuncRef?: Ref<ZoomFunc>
  hiddenLayers?: Iterable<string>
  flags?: Iterable<string>
  activeLocationId?: string | null
  zoomLocationId?: string | null
  detailsLocationId?: string | null
  nowDetails?: ReactNode
  laterDetails?: ReactNode
  locationItemInfo?: Iterable<MapViewerLocationItemInfo>
}

export type MapViewerCallbacks = {
  onSetLevelId?: (id: string) => void
  onSetIsometric?: (isometric: boolean) => void
  onSetLayerVisible?: (layer: string, visible: boolean) => void
  onSetFlag?: (flag: string, enabled: boolean) => void
  onSetActiveLocationId?: (id: string | null) => void
  onSetDetailsLocationId?: (id: string | null) => void
}

export type MapViewerProps = MapViewerConfig &
  MapViewerSettings &
  MapViewerCallbacks & {
    className?: string
  }

const _MapViewer = memo((props: MapViewerProps) => {
  const {
    className,
    objects,
    layers,
    homeURL,
    currentLevelId,
    contentWidth,
    contentHeight,
    zoomFuncRef,
    isometric,
    hiddenLayers,
    flags,
    flagToggles,
    activeLocationId,
    detailsLocationId,
    zoomLocationId,
    nowDetails,
    laterDetails,
    locations = [],
    locationItemInfo = [],
    onSetLevelId,
    onSetIsometric,
    onSetLayerVisible,
    onSetFlag,
    onSetActiveLocationId,
    onSetDetailsLocationId,
  } = useProps("MapViewer", {}, props)

  const rootRef = useRef<HTMLDivElement | null>(null)

  const [zoomFunc, setZoomFunc] = useState<ZoomFunc | null>(null)
  const setZoomFuncRef = useCallback(
    (func: ZoomFunc | null) => {
      setZoomFunc(() => func)

      if (typeof zoomFuncRef == "function") {
        zoomFuncRef(func)
      } else if (zoomFuncRef) {
        zoomFuncRef.current = func
      }
    },
    [zoomFuncRef],
  )

  const [loaded, setLoaded] = useState(false)
  const [svgData, setSVGData] = useState<ReadonlyMap<string, SVGData>>(
    new Map(),
  )

  const levels = useMemo(() => {
    return [...objects].filter(isMapLevel)
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
    return [...objects].map((obj, i) => {
      const objSvg = svgData.get(obj.url)
      if (!objSvg) {
        return null
      }

      if (isMapLevel(obj)) {
        const active = currentLevelId == obj.id
        return (
          <MapViewer.Level
            key={obj.id}
            type={obj.type}
            levelId={obj.id}
            active={active}
            isometric={isometric && !obj.noIsometricTransform}
            svgData={objSvg}
            hiddenLayerIds={hiddenLayers}
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
            hiddenLayerIds={hiddenLayers}
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
    svgData,
    currentLevelId,
    isometric,
    hiddenLayers,
    flags,
    locationItemInfo,
    activeLocationId,
    onSetActiveLocationId,
    onSetDetailsLocationId,
  ])

  useEffect(() => {
    const urls = new Set([...objects].map((o) => o.url))
    const promises = [...urls].map((url) =>
      fetchMapSVG(url).then((data) => [url, data] as const),
    )
    Promise.all(promises).then((entries) => {
      const asMap = new Map(entries)
      setSVGData(asMap)
      setLoaded(true)
    })
  }, [objects])

  useEffect(() => {
    if (zoomLocationId && zoomFunc && rootRef.current) {
      const loc = [...locations].find((l) => l.id == zoomLocationId)
      const zoomAmt = loc?.zoomScale ?? 0.5

      const locCls = mapSVGClassNames.areaId(zoomLocationId)
      const els = rootRef.current.getElementsByClassName(locCls)
      for (const el of els) {
        const styles = window.getComputedStyle(el)
        if (styles.display != "none") {
          zoomFunc(el as HTMLElement, zoomAmt)
          break
        }
      }
    }
  }, [zoomLocationId, locations, zoomFunc])

  const handleZoom = useCallback(
    (type: "in" | "out" | "reset") => {
      zoomFunc && zoomFunc(type)
    },
    [zoomFunc],
  )

  const locationObj = useMemo(() => {
    if (detailsLocationId) {
      return [...locations].find((i) => i.id == detailsLocationId)
    }
  }, [detailsLocationId, locations])

  return (
    <MapViewer.Root ref={rootRef} className={className}>
      {!loaded && <MapViewer.Loading />}
      {loaded && (
        <MapViewer.Content
          zoomFuncRef={setZoomFuncRef}
          contentWidth={contentWidth}
          contentHeight={contentHeight}
        >
          {objectEls}
        </MapViewer.Content>
      )}
      <MapViewer.ZoomMenu homeURL={homeURL} onZoom={handleZoom} />
      {!isometric && (
        <MapViewer.LevelMenu
          selectedLevel={currentLevelId}
          levels={levels}
          onSelectLevel={onSetLevelId}
        />
      )}
      <MapViewer.IsoMenu
        isometric={isometric}
        onSetIsometric={onSetIsometric}
      />
      <MapViewer.ToggleMenu
        layers={layers}
        hiddenLayers={hiddenLayers}
        enabledFlags={flags}
        flagToggles={flagToggles}
        onChangeLayer={onSetLayerVisible}
        onChangeFlag={onSetFlag}
      />
      <MapViewer.DetailsDrawer
        opened={!!locationObj}
        onClose={() => onSetDetailsLocationId && onSetDetailsLocationId(null)}
        MapDetailsProps={
          locationObj
            ? {
                title: locationObj?.title,
                description: locationObj?.description,
                nowChildren: nowDetails,
                laterChildren: laterDetails,
              }
            : undefined
        }
      />
    </MapViewer.Root>
  )
})

_MapViewer.displayName = "MapViewer"

export type MapViewerRootProps = {
  className?: string
  children?: ReactNode
}

export const MapViewerRoot = forwardRef<HTMLDivElement, MapViewerRootProps>(
  (props, ref) => {
    const { className, children } = useProps("MapViewerRoot", {}, props)

    return (
      <Box
        ref={ref}
        className={clsx("MapViewer-root", classes.root, className)}
      >
        {children}
      </Box>
    )
  },
)

MapViewerRoot.displayName = "MapViewerRoot"

export type MapViewerZoomMenuProps = ZoomMenuProps

export const MapViewerZoomMenu = (props: MapViewerZoomMenuProps) => {
  const { ...other } = useProps("MapViewerZoomMenu", {}, props)

  return (
    <ZoomMenu
      className={clsx("MapViewer-zoomMenu", classes.zoomMenu)}
      {...other}
    />
  )
}

export type MapViewerLevelMenuProps = LevelMenuProps

export const MapViewerLevelMenu = (props: MapViewerLevelMenuProps) => {
  const { ...other } = useProps("MapViewerLevelMenu", {}, props)

  return (
    <LevelMenu
      className={clsx("MapViewer-levelMenu", classes.levelMenu)}
      {...other}
    />
  )
}

export type MapViewerIsoMenuProps = {
  isometric?: boolean
  onSetIsometric?: (isometric: boolean) => void
}

export const MapViewerIsoMenu = (props: MapViewerIsoMenuProps) => {
  const { isometric, onSetIsometric } = useProps("MapViewerIsoMenu", {}, props)

  return (
    <ActionIcon
      className={clsx("MapViewer-isoMenu", classes.isoMenu)}
      title="Toggle Isometric View"
      aria-label="toggle isometric view"
      role="checkbox"
      aria-checked={isometric ? "true" : "false"}
      radius="xl"
      variant={isometric ? "filled" : "default"}
      onClick={() => {
        onSetIsometric && onSetIsometric(!isometric)
      }}
    >
      <IconCube />
    </ActionIcon>
  )
}

export type MapViewerToggleMenuProps = ToggleMenuProps

export const MapViewerToggleMenu = (props: MapViewerToggleMenuProps) => {
  const { ...other } = useProps("MapViewerToggleMenu", {}, props)

  const [opened, setOpened] = useState(false)

  return (
    <Box className={clsx("MapViewer-toggleMenu", classes.toggleMenu)}>
      <ToggleMenu {...other} opened={opened} onSetOpened={setOpened} />
    </Box>
  )
}

export type MapViewerLoadingProps = BoxProps & {
  LoaderProps?: Partial<LoaderProps>
}

export const MapViewerLoading = (props: MapViewerLoadingProps) => {
  const { LoaderProps, ...other } = useProps("MapViewerLoading", {}, props)

  return (
    <Box className={clsx("MapViewer-loading", classes.loading)} {...other}>
      <Loader
        className={clsx("MapViewer-loader", classes.loader)}
        type="dots"
        {...LoaderProps}
      />
    </Box>
  )
}

export type MapViewerContentProps = PanZoomProps

export const MapViewerContent = (props: MapViewerContentProps) => {
  const { children, ...other } = useProps("MapViewerContent", {}, props)

  return (
    <PanZoom
      className={clsx("MapViewer-content", classes.content)}
      classNames={{
        content: classes.zoomContent,
      }}
      {...other}
    >
      {children}
    </PanZoom>
  )
}

export type MapViewerObjectProps = {
  svgData: SVGData
  type?: string
  isometric?: boolean
  hiddenLayerIds?: Iterable<string>
  flags?: Iterable<string>
  activeLocationId?: string | null
  locationInfo?: Iterable<
    Readonly<{ id: string; title?: string; icon?: string }>
  >
  onClickArea?: (id: string | null) => void
  onToggleFlag?: (flag: string) => void
} & { className?: string }

export const MapViewerObject = (props: MapViewerObjectProps) => {
  const {
    className,
    svgData,
    type,
    isometric,
    hiddenLayerIds,
    flags,
    activeLocationId,
    locationInfo,
    onClickArea,
    onToggleFlag,
  } = useProps("MapViewerObject", {}, props)

  const [hasIsoCls, hasTransformCls, hasFinishedCls, onTransitionEnd] =
    useIsometricTransition(!!isometric)

  return (
    <Box
      className={clsx(
        classes.object,
        mapViewerClassNames.object,
        type ? mapViewerClassNames.objectType(type) : false,
        {
          [mapViewerClassNames.objectIsometric]: hasIsoCls,
          [mapViewerClassNames.objectIsometricTransform]: hasTransformCls,
        },
        className,
      )}
      onTransitionEnd={onTransitionEnd}
    >
      <MapSVG
        svgData={svgData}
        className={clsx(classes.objectSvg, {
          [mapSVGClassNames.isometric]: hasIsoCls,
          [mapSVGClassNames.isometricTransform]: hasTransformCls,
          [mapSVGClassNames.isometricTransitionFinished]: hasFinishedCls,
        })}
        hiddenLayerIds={hiddenLayerIds}
        flags={flags}
        activeLocationId={activeLocationId}
        locationInfo={locationInfo}
        onClickArea={onClickArea}
        onToggleFlag={onToggleFlag}
      />
    </Box>
  )
}

export type MapViewerLevelProps = {
  levelId: string
  active?: boolean
} & MapViewerObjectProps

export const MapViewerLevel = (props: MapViewerLevelProps) => {
  const { className, levelId, active, ...other } = useProps(
    "MapViewerLevel",
    {},
    props,
  )

  return (
    <MapViewerObject
      className={clsx(
        mapViewerClassNames.level,
        mapViewerClassNames.levelId(levelId),
        {
          [mapViewerClassNames.levelActive]: active,
        },
        className,
      )}
      {...other}
    />
  )
}

export type MapViewerDetailsDrawerProps = {
  MapDetailsProps?: MapDetailsProps
} & MapDetailsDrawerProps

export const MapViewerDetailsDrawer = (props: MapViewerDetailsDrawerProps) => {
  const { className, MapDetailsProps, opened, ...other } = useProps(
    "MapViewerDetailsDrawer",
    {},
    props,
  )

  const prevProps = useRef<MapDetailsProps>(MapDetailsProps)
  useLayoutEffect(() => {
    if (MapDetailsProps && opened) {
      prevProps.current = MapDetailsProps
    }
  }, [MapDetailsProps, opened])

  const curProps =
    opened && MapDetailsProps ? MapDetailsProps : prevProps.current

  return (
    <MapDetails.Drawer
      className={clsx(
        "MapViewer-detailsDrawer",
        classes.detailsDrawer,
        className,
      )}
      opened={opened}
      {...other}
    >
      <MapDetails {...curProps} />
    </MapDetails.Drawer>
  )
}

export const MapViewer = Object.assign(_MapViewer, {
  Root: MapViewerRoot,
  ZoomMenu: MapViewerZoomMenu,
  LevelMenu: MapViewerLevelMenu,
  IsoMenu: MapViewerIsoMenu,
  ToggleMenu: MapViewerToggleMenu,
  Loading: MapViewerLoading,
  Content: MapViewerContent,
  Object: MapViewerObject,
  Level: MapViewerLevel,
  DetailsDrawer: MapViewerDetailsDrawer,
})

const fetchMapSVG = async (url: string): Promise<SVGData> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Could not fetch map ${url}: http status ${res.status}`)
  }

  const text = await res.text()
  return parseSVGData(text)
}
