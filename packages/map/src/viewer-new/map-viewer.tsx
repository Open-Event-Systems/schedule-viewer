import {
  ActionIcon,
  Box,
  type BoxProps,
  Loader,
  type LoaderProps,
  useProps,
} from "@mantine/core"
import { parseSVGData, type SVGData } from "../svg-new/svg.js"
import {
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { MapSVG } from "../svg-new/map-svg.js"
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
import { useIsometricTransition } from "./util.js"
import { mapSVGClassNames } from "../svg-new/classes.js"
import type { MapLayer, MapLevel } from "../types-new.js"

export type MapViewerProps = {
  levels: readonly MapLevel[]
  layers: readonly MapLayer[]
  currentLevelId: string
  contentWidth: number
  contentHeight: number
  isometric?: boolean
  zoomFuncRef?: Ref<ZoomFunc>
  hiddenLayers?: Iterable<string>
  flags?: Iterable<string>
  activeLocationId?: string
  locationInfo?: Iterable<
    Readonly<{ id: string; title?: string; icon?: string }>
  >
  onSetLevelId?: (id: string) => void
  onSetIsometric?: (isometric: boolean) => void
  onSetHiddenLayers?: (layers: Iterable<string>) => void
  onSetActiveLocationId?: (id: string | undefined) => void
}

export const MapViewer = (props: MapViewerProps) => {
  const {
    levels,
    layers,
    currentLevelId,
    contentWidth,
    contentHeight,
    zoomFuncRef,
    isometric,
    hiddenLayers,
    flags,
    activeLocationId,
    locationInfo,
    onSetLevelId,
    onSetIsometric,
    onSetHiddenLayers,
    onSetActiveLocationId,
  } = useProps("MapViewer", {}, props)

  const localZoomFuncRef = useRef<ZoomFunc | null>(null)
  const setZoomFuncRef = useCallback(
    (func: ZoomFunc | null) => {
      localZoomFuncRef.current = func

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

  const levelEls = useMemo(() => {
    return levels.map((lvl) => {
      const lvlSvg = svgData.get(lvl.id)
      if (!lvlSvg) {
        return null
      }

      const active = currentLevelId == lvl.id

      return (
        <MapViewer.Level
          key={lvl.id}
          levelId={lvl.id}
          active={active}
          isometric={isometric}
          svgData={lvlSvg}
          hiddenLayers={hiddenLayers}
          flags={flags}
          locationInfo={locationInfo}
          activeLocationId={activeLocationId}
          onClickArea={onSetActiveLocationId}
        />
      )
    })
  }, [
    levels,
    currentLevelId,
    activeLocationId,
    isometric,
    hiddenLayers,
    flags,
    locationInfo,
    svgData,
    onSetActiveLocationId,
  ])

  useEffect(() => {
    const promises = levels.map((lvl) =>
      fetchMapSVG(lvl.url).then((data) => [lvl.id, data] as const),
    )
    Promise.all(promises).then((svgs) => {
      const asMap = new Map(svgs)
      setSVGData(asMap)
      setLoaded(true)
    })
  }, [levels])

  const handleZoom = useCallback((type: "in" | "out" | "reset") => {
    localZoomFuncRef.current && localZoomFuncRef.current(type)
  }, [])

  return (
    <MapViewer.Root>
      {!loaded && <MapViewer.Loading />}
      {loaded && (
        <MapViewer.Content
          zoomFuncRef={setZoomFuncRef}
          contentWidth={contentWidth}
          contentHeight={contentHeight}
        >
          {levelEls}
        </MapViewer.Content>
      )}
      <MapViewer.ZoomMenu onZoom={handleZoom} />
      <MapViewer.LevelMenu
        selectedLevel={currentLevelId}
        levels={levels}
        onSelectLevel={onSetLevelId}
      />
      <MapViewer.IsoMenu
        isometric={isometric}
        onSetIsometric={onSetIsometric}
      />
      <MapViewer.LayerMenu
        layers={layers}
        hiddenLayers={hiddenLayers}
        onChangeLayers={onSetHiddenLayers}
      />
    </MapViewer.Root>
  )
}

export type MapViewerRootProps = {
  className?: string
  children?: ReactNode
}

const MapViewerRoot = (props: MapViewerRootProps) => {
  const { className, children } = useProps("MapViewerRoot", {}, props)

  return <Box className={clsx("MapViewer-root", className)}>{children}</Box>
}

export type MapViewerZoomMenuProps = ZoomMenuProps

const MapViewerZoomMenu = (props: MapViewerZoomMenuProps) => {
  const { ...other } = useProps("MapViewerZoomMenu", {}, props)

  return <ZoomMenu className="MapViewer-zoomMenu" {...other} />
}

export type MapViewerLevelMenuProps = LevelMenuProps

const MapViewerLevelMenu = (props: MapViewerLevelMenuProps) => {
  const { ...other } = useProps("MapViewerLevelMenu", {}, props)

  return <LevelMenu className="MapViewer-levelMenu" {...other} />
}

export type MapViewerIsoMenuProps = {
  isometric?: boolean
  onSetIsometric?: (isometric: boolean) => void
}

const MapViewerIsoMenu = (props: MapViewerIsoMenuProps) => {
  const { isometric, onSetIsometric } = useProps("MapViewerIsoMenu", {}, props)

  return (
    <ActionIcon
      className="MapViewer-isoMenu"
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
    <Box className="MapViewer-layerMenu">
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
    <Box className="MapViewer-loading" {...other}>
      <Loader className="MapViewer-loader" type="dots" {...LoaderProps} />
    </Box>
  )
}

export type MapViewerContentProps = PanZoomProps

const MapViewerContent = (props: MapViewerContentProps) => {
  const { children, ...other } = useProps("MapViewerContent", {}, props)

  return (
    <PanZoom className="MapViewer-content" {...other}>
      {children}
    </PanZoom>
  )
}

export type MapViewerLevelProps = {
  levelId: string
  svgData: SVGData
  active?: boolean
  isometric?: boolean
  hiddenLayers?: Iterable<string>
  flags?: Iterable<string>
  activeLocationId?: string
  locationInfo?: Iterable<
    Readonly<{ id: string; title?: string; icon?: string }>
  >
  onClickArea?: (id: string | undefined) => void
} & { className?: string }

const MapViewerLevel = (props: MapViewerLevelProps) => {
  const {
    levelId,
    active,
    isometric,
    svgData,
    hiddenLayers,
    flags,
    activeLocationId,
    locationInfo,
    onClickArea,
    className,
  } = useProps("MapViewerLevel", {}, props)

  const [_svgRef, setSVGRef] = useState<SVGSVGElement | null>(null)

  const svgRefCallback = useCallback((el: SVGSVGElement | null) => {
    setSVGRef(el)
  }, [])

  const [hasIsoCls, hasTransformCls, hasFinishedCls, onTransitionEnd] =
    useIsometricTransition(!!isometric)

  return (
    <Box
      className={clsx(
        mapViewerClassNames.level,
        mapViewerClassNames.levelId(levelId),
        {
          [mapViewerClassNames.levelActive]: active,
          [mapViewerClassNames.levelIsometric]: hasIsoCls,
          [mapViewerClassNames.levelIsometricTransform]: hasTransformCls,
        },
        className,
      )}
      onTransitionEnd={onTransitionEnd}
    >
      <MapSVG
        ref={svgRefCallback}
        svgData={svgData}
        className={clsx({
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

MapViewer.Root = MapViewerRoot
MapViewer.ZoomMenu = MapViewerZoomMenu
MapViewer.LevelMenu = MapViewerLevelMenu
MapViewer.IsoMenu = MapViewerIsoMenu
MapViewer.LayerMenu = MapViewerLayerMenu
MapViewer.Loading = MapViewerLoading
MapViewer.Content = MapViewerContent
MapViewer.Level = MapViewerLevel

const fetchMapSVG = async (url: string): Promise<SVGData> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Could not fetch map ${url}: http status ${res.status}`)
  }

  const text = await res.text()
  return parseSVGData(text)
}
