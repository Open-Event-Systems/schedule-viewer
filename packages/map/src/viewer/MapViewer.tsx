import {
  ActionIcon,
  Box,
  BoxProps,
  Button,
  Group,
  Stack,
  useProps,
} from "@mantine/core"
import clsx from "clsx"
import {
  MouseEvent,
  ReactNode,
  RefCallback,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { observer } from "mobx-react-lite"
import {
  MapConfig,
  MapEvent,
  MapLevel,
  MapLocation,
  MapVendor,
} from "../types.js"
import {
  ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch"
import { MapSVG } from "../svg/map-svg.js"
import { getMapClass, MAP_CLASSES } from "../map-classes.js"
import {
  getMapEventsByLocation,
  getMapFlags,
  getMapLocations,
  makeCurrentEventFilter,
  makeFutureEventFilter,
} from "../map.js"
import { MapDetails } from "../details/map-details.js"
import {
  IconCube,
  IconHome,
  IconMinus,
  IconPlus,
  IconZoomScan,
} from "@tabler/icons-react"
import { LayerMenu } from "../layer-menu/layer-menu.js"

export type MapViewerProps = {
  config: MapConfig
  homeURL?: string
  events?: Iterable<MapEvent>
  level?: string | null
  onSetLevel?: (level: string) => void
  highlightId?: string | null
  onSelectLocation?: (id: string | null) => void
  selectionId?: string | null
  flags?: Iterable<string>
  now?: Date
  noIsometricTransition?: boolean
  zoomFuncRef?:
    | RefObject<((id: string) => void) | null>
    | RefCallback<((id: string) => void) | null>
  onClickEvent?: (e: MouseEvent, event: MapEvent) => void
  getEventHref?: (event: MapEvent) => string | undefined
} & BoxProps

export const MapViewer = observer((props: MapViewerProps) => {
  const {
    className,
    config,
    homeURL,
    events = [],
    level,
    onSetLevel,
    highlightId,
    onSelectLocation,
    selectionId,
    flags,
    now: propNow,
    noIsometricTransition,
    zoomFuncRef,
    onClickEvent,
    getEventHref,
    ...other
  } = useProps("MapViewer", {}, props)

  const [svgDataFunc, setSVGDataFunc] = useState<(() => string) | null>(null)
  const [isometric, setIsometric] = useState(false)

  const [svgEl, setSVGEl] = useState<SVGSVGElement | null>(null)

  // locations/vendors
  const locations = useMemo(() => getMapLocations(config), [config])
  const vendors = useMemo(() => {
    // TODO: put this in a function like getMapLocations
    const map = new Map<string, MapVendor>()
    for (const entry of config.vendors) {
      map.set(entry.location, entry)
    }
    return map
  }, [config])

  // layers
  const [hiddenLayers, setHiddenLayers] = useState<ReadonlySet<string>>(
    new Set(),
  )
  const [layerMenuOpened, setLayerMenuOpened] = useState(false)

  // events
  const eventsByLocation = useMemo(() => {
    const sorted = Array.from(events).sort(
      (a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0),
    )
    return getMapEventsByLocation(locations.values(), sorted)
  }, [events, locations])

  const [defaultNow] = useState(() => new Date()) // just use time from first render
  const now = propNow || defaultNow

  const [curEventByLocation, futureEventByLocation] = useMemo(() => {
    const cur = new Map<string, MapEvent>()
    const future = new Map<string, MapEvent>()
    for (const [locId, locEvents] of eventsByLocation.entries()) {
      const curEvents = locEvents.filter(makeCurrentEventFilter(now))
      if (curEvents.length > 0) {
        cur.set(locId, curEvents[0])
      }

      const futureEvents = locEvents.filter(makeFutureEventFilter(240, now))
      if (futureEvents.length > 0) {
        future.set(locId, futureEvents[0])
      }
    }

    return [cur, future]
  }, [eventsByLocation, now])

  const eventText = useMemo(() => {
    const map = new Map<string, string>()
    for (const [loc, event] of curEventByLocation.entries()) {
      if (event.title) {
        map.set(loc, event.title)
      }
    }
    return map
  }, [curEventByLocation])

  // selection
  const selectedLoc = selectionId ? locations.get(selectionId) : undefined
  const lastSelectedLoc = useRef<MapLocation | null>(selectedLoc ?? null)
  if (selectedLoc) {
    lastSelectedLoc.current = selectedLoc
  }

  // TODO: clean up/improve handling vendor vs location
  const curSelectionData = selectedLoc ?? lastSelectedLoc.current
  const selectedVendor = curSelectionData?.id
    ? vendors.get(curSelectionData.id)
    : undefined

  useEffect(() => {
    fetch(config.src)
      .then((resp) => resp.text())
      .then((body) => {
        setSVGDataFunc(() => () => body)
      })
  }, [config.src])

  // flags
  const curFlags = useMemo(() => {
    const flagSet = getMapFlags(config, now)
    for (const flag of flags ?? []) {
      flagSet.add(flag)
    }
    return flagSet
  }, [config, flags, now])

  const setZoomRef = useCallback(
    (ctx: ReactZoomPanPinchContentRef | null) => {
      let zoomFunc = null

      if (svgEl && ctx) {
        zoomFunc = (id: string) => {
          const areaEls =
            svgEl?.getElementsByClassName(
              getMapClass(MAP_CLASSES.areaPrefix, id),
            ) ?? []
          if (areaEls[0]) {
            const location = locations.get(id)

            const zoomScale = location?.zoomScale

            // docs say you can't zoom to svgelement, but appears to work?
            // https://github.com/BetterTyped/react-zoom-pan-pinch/issues/215#issuecomment-1416803480
            ctx.zoomToElement(areaEls[0] as Element as HTMLElement, zoomScale)
          }
        }
      }

      if (typeof zoomFuncRef == "function") {
        zoomFuncRef(zoomFunc)
      } else if (zoomFuncRef && typeof zoomFuncRef == "object") {
        zoomFuncRef.current = zoomFunc
      }
    },
    [zoomFuncRef, locations, svgEl],
  )

  return (
    <TransformWrapper
      ref={setZoomRef}
      limitToBounds={false}
      centerOnInit
      panning={{
        velocityDisabled: true,
      }}
      minScale={config.minScale}
      maxScale={config.maxScale}
    >
      {(ctx) => {
        return (
          <>
            <Box className={clsx("MapViewer-root", className)} {...other}>
              <TransformComponent
                wrapperClass="MapViewer-wrapper"
                contentClass="MapViewer-content"
              >
                {svgDataFunc ? (
                  <MapSVG
                    ref={setSVGEl}
                    getSVGData={svgDataFunc}
                    level={level ?? config.defaultLevel}
                    hiddenLayers={hiddenLayers}
                    highlightId={highlightId}
                    onSelectLocation={(id) => {
                      onSelectLocation && onSelectLocation(id)
                    }}
                    vendors={config.vendors}
                    flags={curFlags}
                    eventText={eventText}
                    isometric={isometric}
                    noIsometricTransition={noIsometricTransition}
                  />
                ) : null}
              </TransformComponent>
              <ControlsTopRight>
                {!isometric && (
                  <LevelButtons
                    levels={config.levels}
                    selected={level ?? config.defaultLevel}
                    onChangeLevel={(lvl) => {
                      onSetLevel && onSetLevel(lvl)
                    }}
                  />
                )}
              </ControlsTopRight>
              <ControlsTopLeft>
                {homeURL && (
                  <ActionIcon
                    component="a"
                    title="Home"
                    radius="xl"
                    variant="default"
                    href={homeURL}
                  >
                    <IconHome />
                  </ActionIcon>
                )}
                <ActionIcon
                  title="Zoom In"
                  radius="xl"
                  variant="default"
                  onClick={() => {
                    ctx.zoomIn()
                  }}
                >
                  <IconPlus />
                </ActionIcon>
                <ActionIcon
                  title="Zoom Out"
                  radius="xl"
                  variant="default"
                  onClick={() => {
                    ctx.zoomOut()
                  }}
                >
                  <IconMinus />
                </ActionIcon>
                <ActionIcon
                  title="Reset Zoom"
                  radius="xl"
                  variant="default"
                  onClick={() => {
                    ctx.resetTransform()
                  }}
                >
                  <IconZoomScan />
                </ActionIcon>
              </ControlsTopLeft>
              <ControlsBottomLeft>
                <ActionIcon
                  title="Toggle Isometric View"
                  radius="xl"
                  variant={isometric ? "filled" : "default"}
                  onClick={() => {
                    ctx.resetTransform(0)
                    setIsometric(!isometric)
                  }}
                >
                  <IconCube />
                </ActionIcon>
              </ControlsBottomLeft>
              <ControlsBottomRight>
                <LayerMenu
                  layers={config.layers.map(({ id, title }) => ({
                    id,
                    label: title,
                  }))}
                  opened={layerMenuOpened}
                  onSetOpened={setLayerMenuOpened}
                  hiddenLayers={hiddenLayers}
                  onChangeLayers={setHiddenLayers}
                />
              </ControlsBottomRight>
            </Box>
            <MapDetails.Drawer
              opened={!!selectedLoc}
              onClose={() => onSelectLocation && onSelectLocation(null)}
              title={
                selectedVendor ? selectedVendor.name : curSelectionData?.title
              }
              description={
                selectedVendor
                  ? selectedVendor.description
                  : curSelectionData?.description
              }
              type={curSelectionData?.type}
              currentEvent={
                curSelectionData
                  ? curEventByLocation.get(curSelectionData.id)
                  : undefined
              }
              futureEvent={
                curSelectionData
                  ? futureEventByLocation.get(curSelectionData.id)
                  : undefined
              }
              getEventHref={getEventHref}
              onClickEvent={onClickEvent}
            />
          </>
        )
      }}
    </TransformWrapper>
  )
})

MapViewer.displayName = "MapViewer"

const ControlsTopRight = ({ children }: { children?: ReactNode }) => {
  return (
    <Stack className="MapViewer-controlsTopRight" gap="xs" p="xs">
      {children}
    </Stack>
  )
}

const LevelButtons = ({
  levels,
  selected,
  onChangeLevel,
}: {
  selected?: string
  levels: readonly MapLevel[]
  onChangeLevel?: (lvl: string) => void
}) => {
  return (
    <Stack className="MapViewer-levelButtons" gap="xs">
      {levels.map((lvl) => (
        <Button
          key={lvl.id}
          size="compact-xs"
          variant={lvl.id === selected ? "filled" : "default"}
          onClick={() => {
            if (lvl.id !== selected) {
              onChangeLevel && onChangeLevel(lvl.id)
            }
          }}
        >
          {lvl.title}
        </Button>
      ))}
    </Stack>
  )
}

const ControlsTopLeft = ({ children }: { children?: ReactNode }) => {
  return (
    <Group className="MapViewer-controlsTopLeft" gap="xs" p="xs">
      {children}
    </Group>
  )
}

const ControlsBottomLeft = ({ children }: { children?: ReactNode }) => {
  return (
    <Group className="MapViewer-controlsBottomLeft" gap="xs" p="xs">
      {children}
    </Group>
  )
}

const ControlsBottomRight = ({ children }: { children?: ReactNode }) => {
  return (
    <Group className="MapViewer-controlsBottomRight" gap="xs" p="xs">
      {children}
    </Group>
  )
}
