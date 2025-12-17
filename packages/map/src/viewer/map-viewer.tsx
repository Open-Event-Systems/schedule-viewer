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
  type ComponentType,
  forwardRef,
  memo,
  type MemoExoticComponent,
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
import { LayerMenu, type LayerMenuProps } from "../layer-menu/layer-menu.js"
import {
  PanZoom,
  type PanZoomProps,
  type ZoomFunc,
} from "../panzoom/panzoom.js"
import { IconCube } from "@tabler/icons-react"
import { isMapLevel, useIsometricTransition } from "./util.js"
import { mapSVGClassNames } from "../svg/classes.js"
import type { MapLayer, MapLocation, MapObject } from "../types.js"
import {
  MapDetails,
  type MapDetailsDrawerProps,
  type MapDetailsProps,
} from "../details/map-details.js"

import classes from "./map-viewer.module.scss"
import "./map.scss"

export type MapViewerLocationItemInfo = Readonly<{
  id: string
  title?: string
  icon?: string
}>

export type MapViewerConfig = {
  objects: Iterable<MapObject>
  layers: Iterable<MapLayer>
  locations: Iterable<MapLocation>
  contentWidth: number
  contentHeight: number
}

export type MapViewerSettings = {
  currentLevelId: string
  isometric?: boolean
  zoomFuncRef?: Ref<ZoomFunc>
  hiddenLayers?: Iterable<string>
  flags?: Iterable<string>
  activeLocationId?: string
  zoomLocationId?: string
  detailsLocationId?: string
  nowDetails?: ReactNode
  laterDetails?: ReactNode
  locationItemInfo?: Iterable<MapViewerLocationItemInfo>
}

export type MapViewerCallbacks = {
  onSetLevelId?: (id: string) => void
  onSetIsometric?: (isometric: boolean) => void
  onSetHiddenLayers?: (layers: Iterable<string>) => void
  onSetActiveLocationId?: (id: string | undefined) => void
  onSetDetailsLocationId?: (id: string | undefined) => void
}

export type MapViewerProps = MapViewerConfig &
  MapViewerSettings &
  MapViewerCallbacks

type MapViewerType = MemoExoticComponent<ComponentType<MapViewerProps>> & {
  Root: typeof MapViewerRoot
  ZoomMenu: typeof MapViewerZoomMenu
  LevelMenu: typeof MapViewerLevelMenu
  IsoMenu: typeof MapViewerIsoMenu
  LayerMenu: typeof MapViewerLayerMenu
  Loading: typeof MapViewerLoading
  Content: typeof MapViewerContent
  Object: typeof MapViewerObject
  Level: typeof MapViewerLevel
  DetailsDrawer: typeof MapViewerDetailsDrawer
}

export const MapViewer = memo((props: MapViewerProps) => {
  const {
    objects,
    layers,
    currentLevelId,
    contentWidth,
    contentHeight,
    zoomFuncRef,
    isometric,
    hiddenLayers,
    flags,
    activeLocationId,
    detailsLocationId,
    zoomLocationId,
    nowDetails,
    laterDetails,
    locations = [],
    locationItemInfo = [],
    onSetLevelId,
    onSetIsometric,
    onSetHiddenLayers,
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
            hiddenLayers={hiddenLayers}
            flags={flags}
            locationInfo={locationItemInfo}
            activeLocationId={activeLocationId}
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
            hiddenLayers={hiddenLayers}
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
        zoomFunc(el as HTMLElement, zoomAmt)
        break
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
    <MapViewer.Root ref={rootRef}>
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
      <MapViewer.ZoomMenu onZoom={handleZoom} />
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
      <MapViewer.LayerMenu
        layers={layers}
        hiddenLayers={hiddenLayers}
        onChangeLayers={onSetHiddenLayers}
      />
      <MapViewer.DetailsDrawer
        opened={!!locationObj}
        onClose={() =>
          onSetDetailsLocationId && onSetDetailsLocationId(undefined)
        }
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
}) as MapViewerType

MapViewer.displayName = "MapViewer"

export type MapViewerRootProps = {
  className?: string
  children?: ReactNode
}

const MapViewerRoot = forwardRef<HTMLDivElement, MapViewerRootProps>(
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

const MapViewerZoomMenu = (props: MapViewerZoomMenuProps) => {
  const { ...other } = useProps("MapViewerZoomMenu", {}, props)

  return (
    <ZoomMenu
      className={clsx("MapViewer-zoomMenu", classes.zoomMenu)}
      {...other}
    />
  )
}

export type MapViewerLevelMenuProps = LevelMenuProps

const MapViewerLevelMenu = (props: MapViewerLevelMenuProps) => {
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

const MapViewerIsoMenu = (props: MapViewerIsoMenuProps) => {
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

export type MapViewerLayerMenuProps = LayerMenuProps

const MapViewerLayerMenu = (props: MapViewerLayerMenuProps) => {
  const { ...other } = useProps("MapViewerLayerMenu", {}, props)

  const [opened, setOpened] = useState(false)

  return (
    <Box className={clsx("MapViewer-layerMenu", classes.layerMenu)}>
      <LayerMenu {...other} opened={opened} onSetOpened={setOpened} />
    </Box>
  )
}

export type MapViewerLoadingProps = BoxProps & {
  LoaderProps?: Partial<LoaderProps>
}

const MapViewerLoading = (props: MapViewerLoadingProps) => {
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

const MapViewerContent = (props: MapViewerContentProps) => {
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
  hiddenLayers?: Iterable<string>
  flags?: Iterable<string>
  activeLocationId?: string
  locationInfo?: Iterable<
    Readonly<{ id: string; title?: string; icon?: string }>
  >
  onClickArea?: (id: string | undefined) => void
} & { className?: string }

const MapViewerObject = (props: MapViewerObjectProps) => {
  const {
    className,
    svgData,
    type,
    isometric,
    hiddenLayers,
    flags,
    activeLocationId,
    locationInfo,
    onClickArea,
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
        hiddenLayers={hiddenLayers}
        flags={flags}
        activeLocation={activeLocationId}
        locationInfo={locationInfo}
        onClickArea={onClickArea}
      />
    </Box>
  )
}

export type MapViewerLevelProps = {
  levelId: string
  active?: boolean
} & MapViewerObjectProps

const MapViewerLevel = (props: MapViewerLevelProps) => {
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

const MapViewerDetailsDrawer = (props: MapViewerDetailsDrawerProps) => {
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

MapViewer.Root = MapViewerRoot
MapViewer.ZoomMenu = MapViewerZoomMenu
MapViewer.LevelMenu = MapViewerLevelMenu
MapViewer.IsoMenu = MapViewerIsoMenu
MapViewer.LayerMenu = MapViewerLayerMenu
MapViewer.Loading = MapViewerLoading
MapViewer.Content = MapViewerContent
MapViewer.Object = MapViewerObject
MapViewer.Level = MapViewerLevel
MapViewer.DetailsDrawer = MapViewerDetailsDrawer

const fetchMapSVG = async (url: string): Promise<SVGData> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Could not fetch map ${url}: http status ${res.status}`)
  }

  const text = await res.text()
  return parseSVGData(text)
}
