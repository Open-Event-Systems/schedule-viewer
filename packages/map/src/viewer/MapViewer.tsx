import { Box, BoxProps, Button, Stack, useProps } from "@mantine/core"
import clsx from "clsx"
import {
  MutableRefObject,
  ReactNode,
  RefCallback,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { observer } from "mobx-react-lite"
import { MapConfig, MapLevel, MapLocation } from "../types.js"
import {
  ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch"
import { getMapSVGProps, MapSVG } from "../svg/map-svg.js"
import { getMapClass, MAP_CLASSES } from "../map-classes.js"
import { getMapLocations } from "../map.js"
import { MapDetails } from "../details/map-details.js"

export type MapViewerProps = {
  config: MapConfig
  level?: string | null
  onSetLevel?: (level: string) => void
  highlightId?: string | null
  onSelectLocation?: (id: string | null) => void
  selectionId?: string | null
  zoomFuncRef?:
    | MutableRefObject<((id: string) => void) | null>
    | RefCallback<((id: string) => void) | null>
} & BoxProps

export const MapViewer = observer((props: MapViewerProps) => {
  const {
    className,
    config,
    level,
    onSetLevel,
    highlightId,
    onSelectLocation,
    selectionId,
    zoomFuncRef,
    ...other
  } = useProps("MapViewer", {}, props)

  const [svgData, setSVGData] = useState<string | null>(null)
  const [isometric, setIsometric] = useState(false)

  const [svgProps, svgStr] = useMemo(() => {
    return svgData ? getMapSVGProps(svgData) : [null, ""]
  }, [svgData])
  const [svgEl, setSVGEl] = useState<SVGSVGElement | null>(null)

  const locations = useMemo(() => getMapLocations(config), [config])

  const selectedLoc = selectionId ? locations.get(selectionId) : null

  const lastSelectedLoc = useRef<MapLocation | null>(selectedLoc ?? null)
  if (selectedLoc) {
    lastSelectedLoc.current = selectedLoc
  }

  const curSelectedLoc = selectedLoc ?? lastSelectedLoc.current

  useEffect(() => {
    fetch(config.src)
      .then((resp) => resp.text())
      .then((body) => {
        setSVGData(body)
      })
  }, [config.src])

  const setZoomRef = useCallback(
    (ctx: ReactZoomPanPinchContentRef) => {
      const zoomFunc = (id: string) => {
        const areaEls =
          svgEl?.getElementsByClassName(
            getMapClass(MAP_CLASSES.areaPrefix, id),
          ) ?? []
        if (areaEls[0]) {
          // docs say you can't zoom to svgelement, but appears to work?
          // https://github.com/BetterTyped/react-zoom-pan-pinch/issues/215#issuecomment-1416803480
          ctx.zoomToElement(areaEls[0] as Element as HTMLElement, 2)
        }
      }

      if (typeof zoomFuncRef == "function") {
        zoomFuncRef(zoomFunc)
      } else if (zoomFuncRef && typeof zoomFuncRef == "object") {
        zoomFuncRef.current = zoomFunc
      }
    },
    [zoomFuncRef, svgEl],
  )

  // useEffect(() => {
  //   const el = ctx?.instance.contentComponent
  //   if (svgData && el) {
  //     el.innerHTML = svgData
  //     const els = el.getElementsByTagName("svg")
  //     if (els.length > 0) {
  //       const focusFunc = (el: SVGElement) => {
  //         // docs say you can't zoom to svgelement, but appears to work?
  //         // https://github.com/BetterTyped/react-zoom-pan-pinch/issues/215#issuecomment-1416803480
  //         ctx.zoomToElement(el as Element as HTMLElement)
  //       }

  //       control.setup(els[0] as SVGSVGElement, focusFunc)
  //     }
  //   }
  // }, [control, svgData, ctx])

  return (
    <TransformWrapper
      ref={setZoomRef}
      limitToBounds={false}
      minScale={0.1}
      centerOnInit
    >
      <Box className={clsx("MapViewer-root", className)} {...other}>
        <TransformComponent
          wrapperClass="MapViewer-wrapper"
          contentClass="MapViewer-content"
        >
          {svgProps ? (
            <MapSVG
              {...svgProps}
              ref={setSVGEl}
              level={level ?? config.defaultLevel}
              highlightId={highlightId}
              onSelectLocation={(id) => {
                onSelectLocation && onSelectLocation(id)
              }}
              isometric={isometric}
              dangerouslySetInnerHTML={{ __html: svgStr }}
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
        title={curSelectedLoc?.title}
        description={curSelectedLoc?.description}
        opened={!!selectedLoc}
        onClose={() => onSelectLocation && onSelectLocation(null)}
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
