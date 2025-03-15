import { Box, BoxProps, Button, Stack, useProps } from "@mantine/core"
import clsx from "clsx"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { MapControl } from "../control.js"
import { observer } from "mobx-react-lite"
import { MapLevel } from "../types.js"
import {
  ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
  useControls,
} from "react-zoom-pan-pinch"

export type MapViewerProps = {
  src: string
  control: MapControl
} & BoxProps

export const MapViewer = observer((props: MapViewerProps) => {
  const { className, src, control, ...other } = useProps("MapViewer", {}, props)
  // const [el, setEl] = useState<SVGSVGElement | null>(null)
  const [svgData, setSVGData] = useState<string | null>(null)
  const [ctx, setCtx] = useState<ReactZoomPanPinchContentRef | null>(null)

  // useEffect(() => {
  //   if (el) {
  //     const promise = control.load(el)
  //     return () => {
  //       promise.then((dispose) => dispose())
  //     }
  //   }
  // }, [control, el])

  // const controls = useControls

  // const [svgData, setSVGData] = useState<string | null>(null)
  // const [wrapperEl, setWrapperEl] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    fetch(src)
      .then((res) => {
        return res.text()
      })
      .then((svg) => {
        setSVGData(svg)
      })
  }, [src])

  useEffect(() => {
    if (svgData && ctx?.instance.contentComponent) {
      ctx.instance.contentComponent.innerHTML = svgData
      const els = ctx.instance.contentComponent.getElementsByTagName("svg")
      if (els.length > 0) {
        // docs say you can't zoom to svgelement, but appears to work?
        // https://github.com/BetterTyped/react-zoom-pan-pinch/issues/215#issuecomment-1416803480
        control.setup(els[0] as SVGSVGElement, ctx)
      }
    }
  }, [control, svgData, ctx])

  return (
    <TransformWrapper
      ref={setCtx}
      limitToBounds={false}
      minScale={0.1}
      centerOnInit
    >
      <Box className={clsx("MapViewer-root", className)} {...other}>
        <TransformComponent
          wrapperClass="MapViewer-wrapper"
          contentClass="MapViewer-content"
        >
          {null}
        </TransformComponent>

        {!!control && (
          <ControlsRight>
            <Button
              variant={control.isometric ? "filled" : "default"}
              size="compact-xs"
              onClick={() => {
                control.isometric = !control.isometric
              }}
            >
              3D Layout
            </Button>
            {!control.isometric && (
              <LevelButtons
                levels={control.config.levels}
                selected={control.level}
                onChangeLevel={(lvl) => (control.level = lvl)}
              />
            )}
          </ControlsRight>
        )}
      </Box>
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
