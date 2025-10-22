import { Box, BoxProps, useProps } from "@mantine/core"
import clsx from "clsx"
import { ReactNode, Ref, useCallback, useLayoutEffect, useState } from "react"
import {
  ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch"

export type ZoomFunc = (el: HTMLElement | SVGElement, scale?: number) => void

export type PanZoomProps = {
  children?: ReactNode
  width?: number
  height?: number
  mapWidth?: number
  mapHeight?: number
  zoomFuncRef?: Ref<ZoomFunc>
} & BoxProps

export const PanZoom = (props: PanZoomProps) => {
  const {
    className,
    width,
    height,
    mapWidth,
    mapHeight,
    children,
    zoomFuncRef,
    ...other
  } = useProps("PanZoom", {}, props)

  const [elSize, setElSize] =
    useState<Readonly<{ width: number; height: number }>>()

  const [observer] = useState<ResizeObserver>(
    () =>
      new ResizeObserver((entries) => {
        for (const entry of entries) {
          setElSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          })
        }
      }),
  )

  const [el, setEl] = useState<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (el) {
      observer.observe(el)
      return () => {
        observer.unobserve(el)
      }
    }
  }, [el, observer])

  const setZoomRef = useCallback(
    (ref: ReactZoomPanPinchContentRef | null) => {
      const zoomFunc = (el: HTMLElement | SVGElement, scale?: number) => {
        // docs say you can't zoom to svgelement, but appears to work?
        // https://github.com/BetterTyped/react-zoom-pan-pinch/issues/215#issuecomment-1416803480
        ref?.zoomToElement(el as HTMLElement, scale)
      }

      if (typeof zoomFuncRef == "function") {
        zoomFuncRef(zoomFunc)
      } else if (zoomFuncRef) {
        zoomFuncRef.current = zoomFunc
      }
    },
    [zoomFuncRef],
  )

  const initialScale = computeScale(
    elSize?.width ?? el?.clientWidth,
    elSize?.height ?? el?.clientHeight,
    mapWidth,
    mapHeight,
  )

  return (
    <Box ref={setEl} className={clsx("PanZoom-root", className)} {...other}>
      {el && (
        <TransformWrapper
          ref={setZoomRef}
          limitToBounds={false}
          minScale={0.1}
          maxScale={10}
          panning={{
            velocityDisabled: true,
          }}
          initialScale={initialScale}
        >
          {() => (
            <TransformComponent
              wrapperClass="PanZoom-wrapper"
              contentClass="PanZoom-content"
            >
              {children}
            </TransformComponent>
          )}
        </TransformWrapper>
      )}
    </Box>
  )
}

const computeScale = (
  width: number | undefined,
  height: number | undefined,
  mapWidth: number | undefined,
  mapHeight: number | undefined,
): number => {
  let initialScale

  if (width && height && mapWidth && mapHeight) {
    if (width < height) {
      initialScale = width / mapWidth
    } else {
      initialScale = height / mapHeight
    }
  }

  return initialScale ?? 1
}
