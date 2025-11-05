import { Box, type BoxProps, useProps } from "@mantine/core"
import clsx from "clsx"
import {
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  type ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch"

import classes from "./panzoom.module.scss"

export interface ZoomFunc {
  (el: HTMLElement | SVGElement, scale?: number): void
  (action: "in" | "out" | "reset"): void
}

export type PanZoomProps = {
  classNames?: {
    root?: string
    wrapper?: string
    content?: string
  }
  children?: ReactNode
  contentWidth?: number
  contentHeight?: number
  zoomFuncRef?: Ref<ZoomFunc>
} & BoxProps

export const PanZoom = (props: PanZoomProps) => {
  const {
    className,
    classNames,
    contentWidth,
    contentHeight,
    children,
    zoomFuncRef,
    ...other
  } = useProps("PanZoom", {}, props)

  const [el, setEl] = useState<HTMLDivElement | null>(null)

  const initialScaleRef = useRef(1)

  const initialScale = useMemo(() => {
    return computeInitialScale(
      contentWidth,
      contentHeight,
      el?.clientWidth,
      el?.clientHeight,
    )
  }, [contentWidth, contentHeight, el])

  useEffect(() => {
    initialScaleRef.current = initialScale
  }, [initialScale])

  const setZoomRef = useCallback(
    (ref: ReactZoomPanPinchContentRef | null) => {
      const zoomFunc = (
        arg0: HTMLElement | SVGElement | string,
        arg1?: number,
      ) => {
        if (arg0 instanceof HTMLElement || arg0 instanceof SVGElement) {
          // docs say you can't zoom to svgelement, but appears to work?
          // https://github.com/BetterTyped/react-zoom-pan-pinch/issues/215#issuecomment-1416803480
          ref?.zoomToElement(arg0 as HTMLElement, arg1)
        } else if (arg0 == "in") {
          ref?.zoomIn()
        } else if (arg0 == "out") {
          ref?.zoomOut()
        } else if (arg0 == "reset") {
          ref?.centerView(initialScaleRef.current)
        }
      }

      if (typeof zoomFuncRef == "function") {
        zoomFuncRef(zoomFunc)
      } else if (zoomFuncRef) {
        zoomFuncRef.current = zoomFunc
      }
    },
    [zoomFuncRef],
  )

  return (
    <Box
      ref={setEl}
      className={clsx(
        "PanZoom-root",
        classes.root,
        classNames?.root,
        className,
      )}
      {...other}
    >
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
          centerOnInit
        >
          {() => (
            <TransformComponent
              wrapperClass={clsx(
                "PanZoom-wrapper",
                classNames?.wrapper,
                classes.wrapper,
              )}
              contentClass={clsx(
                "PanZoom-content",
                classNames?.content,
                classes.content,
              )}
            >
              {children}
            </TransformComponent>
          )}
        </TransformWrapper>
      )}
    </Box>
  )
}

const computeInitialScale = (
  contentWidth?: number,
  contentHeight?: number,
  frameWidth?: number,
  frameHeight?: number,
) => {
  if (!contentWidth || !contentHeight || !frameWidth || !frameHeight) {
    return 1
  }

  const contentRatio = contentWidth / contentHeight
  const frameRatio = frameWidth / frameHeight
  if (frameRatio > contentRatio) {
    return frameHeight / contentHeight
  } else {
    return frameWidth / contentWidth
  }
}
