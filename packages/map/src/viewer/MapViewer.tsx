import { Box, BoxProps, Button, Stack, useProps } from "@mantine/core"
import clsx from "clsx"
import {
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

export type MapViewerProps = {
  config: MapConfig
  events?: Iterable<MapEvent>
  level?: string | null
  onSetLevel?: (level: string) => void
  highlightId?: string | null
  onSelectLocation?: (id: string | null) => void
  selectionId?: string | null
  flags?: Iterable<string>
  zoomFuncRef?:
    | RefObject<((id: string) => void) | null>
    | RefCallback<((id: string) => void) | null>
} & BoxProps

export const MapViewer = observer((props: MapViewerProps) => {
  const {
    className,
    config,
    events = [],
    level,
    onSetLevel,
    highlightId,
    onSelectLocation,
    selectionId,
    flags,
    zoomFuncRef,
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

  // events
  const eventsByLocation = useMemo(() => {
    const sorted = Array.from(events).sort(
      (a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0),
    )
    return getMapEventsByLocation(locations.values(), sorted)
  }, [events, locations])

  const [now] = useState(() => new Date()) // just use time from first render

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
  }, [eventsByLocation])

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
    const now = new Date()
    const flagSet = getMapFlags(config, now)
    for (const flag of flags ?? []) {
      flagSet.add(flag)
    }
    return flagSet
  }, [config, flags])

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
      centerZoomedOut
      minScale={config.minScale}
      maxScale={config.maxScale}
    >
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
              highlightId={highlightId}
              onSelectLocation={(id) => {
                onSelectLocation && onSelectLocation(id)
              }}
              vendors={config.vendors}
              flags={curFlags}
              eventText={eventText}
              isometric={isometric}
            />
          ) : null}
        </TransformComponent>

        <ControlsRight>
          <Button
            variant={isometric ? "filled" : "default"}
            size="compact-xs"
            onClick={() => {
              setIsometric(!isometric)
            }}
          >
            3D Layout
          </Button>
          {!isometric && (
            <LevelButtons
              levels={config.levels}
              selected={level ?? config.defaultLevel}
              onChangeLevel={(lvl) => {
                onSetLevel && onSetLevel(lvl)
              }}
            />
          )}
        </ControlsRight>
      </Box>
      <MapDetails.Drawer
        opened={!!selectedLoc}
        onClose={() => onSelectLocation && onSelectLocation(null)}
        title={selectedVendor ? selectedVendor.name : curSelectionData?.title}
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
      />
    </TransformWrapper>
  )
})

MapViewer.displayName = "MapViewer"

const ControlsRight = ({ children }: { children?: ReactNode }) => {
  return (
    <Stack className="MapViewer-controlsRight" gap="xs" p="xs">
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
