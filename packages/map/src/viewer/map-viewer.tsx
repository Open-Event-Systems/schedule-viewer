import {
  ActionIcon,
  Box,
  type BoxProps,
  Loader,
  type LoaderProps,
  useProps,
} from "@mantine/core"
import {
  forwardRef,
  memo,
  type ReactNode,
  type Ref,
  useCallback,
  useLayoutEffect,
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
import { useIsometricTransition, useMapViewer } from "./hooks.js"
import type { SVGData } from "../svg/svg.js"

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
  hiddenLayerIds?: Iterable<string>
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
    hiddenLayerIds,
    flags,
    flagToggles,
    activeLocationId,
    detailsLocationId,
    zoomLocationId,
    nowDetails,
    laterDetails,
    locations,
    locationItemInfo,
    onSetLevelId,
    onSetIsometric,
    onSetLayerVisible,
    onSetFlag,
    onSetActiveLocationId,
    onSetDetailsLocationId,
  } = useProps("MapViewer", {}, props)

  const [rootEl, setRootEl] = useState<Element | null>(null)

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

  const { children, handleZoom, levels, ready, detailsLocation } = useMapViewer(
    rootEl,
    zoomFunc,
    {
      currentLevelId,
      locations,
      objects,
      activeLocationId,
      detailsLocationId,
      flags,
      hiddenLayerIds,
      isometric,
      locationItemInfo,
      onSetActiveLocationId,
      onSetDetailsLocationId,
      onSetFlag,
      zoomLocationId,
    },
  )

  return (
    <MapViewer.Root ref={setRootEl} className={className}>
      {!ready && <MapViewer.Loading />}
      {ready && (
        <MapViewer.Content
          zoomFuncRef={setZoomFuncRef}
          contentWidth={contentWidth}
          contentHeight={contentHeight}
        >
          {children}
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
        hiddenLayerIds={hiddenLayerIds}
        enabledFlags={flags}
        flagToggles={flagToggles}
        onChangeLayer={onSetLayerVisible}
        onChangeFlag={onSetFlag}
      />
      <MapViewer.DetailsDrawer
        opened={!!detailsLocation}
        onClose={() => onSetDetailsLocationId && onSetDetailsLocationId(null)}
        MapDetailsProps={
          detailsLocation
            ? {
                title: detailsLocation?.title,
                description: detailsLocation?.description,
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

  const { svgClassNames, wrapperClassNames, onTransitionEnd } =
    useIsometricTransition(isometric)

  return (
    <Box
      className={clsx(
        classes.object,
        mapViewerClassNames.object,
        type ? mapViewerClassNames.objectType(type) : false,
        wrapperClassNames,
        className,
      )}
      onTransitionEnd={onTransitionEnd}
    >
      <MapSVG
        svgData={svgData}
        className={clsx(classes.objectSvg, svgClassNames)}
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
