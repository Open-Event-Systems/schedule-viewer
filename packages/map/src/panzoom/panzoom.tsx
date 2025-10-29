import { Box, type BoxProps, useProps } from "@mantine/core"
import clsx from "clsx"
import {
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react"
import {
  type ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch"

export interface ZoomFunc {
  (el: HTMLElement | SVGElement, scale?: number): void
  (action: "in" | "out" | "reset"): void
}

export type PanZoomProps = {
  children?: ReactNode
  contentWidth?: number
  contentHeight?: number
  zoomFuncRef?: Ref<ZoomFunc>
} & BoxProps

export const PanZoom = (props: PanZoomProps) => {
  const {
    className,
    contentWidth,
    contentHeight,
    children,
    zoomFuncRef,
    ...other
  } = useProps("PanZoom", {}, props)

  // very complicated way to determine the correct 100% scale
  const [sizeState] = useState(() => new SizeState(contentWidth, contentHeight))

  useEffect(() => {
    return () => {
      sizeState.dispose()
    }
  }, [sizeState])

  useLayoutEffect(() => {
    sizeState.setContentSize(contentWidth, contentHeight)
  })

  const [initialScale, ready] = useSyncExternalStore(
    sizeState.subscribe,
    sizeState.getSnapshot,
  )

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
          ref?.centerView(sizeState.getSnapshot()[0])
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
      ref={sizeState.setEl}
      className={clsx("PanZoom-root", className)}
      {...other}
    >
      {ready && (
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

class SizeState {
  private frameWidth: number | undefined = undefined
  private frameHeight: number | undefined = undefined

  private el: HTMLDivElement | null = null

  private state: readonly [number, boolean] = [1, false]

  private resizeObserver: ResizeObserver | null = null
  private observers: (() => void)[] = []

  constructor(
    private contentWidth?: number,
    private contentHeight?: number,
  ) {
    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(this.onResize)
    }
  }

  private onResize = (entries: ResizeObserverEntry[]) => {
    const e = entries[0]
    if (e) {
      this.frameWidth = e.contentRect.width
      this.frameHeight = e.contentRect.height
      this.update()
    }
  }

  private update() {
    const scale = computeInitialScale(
      this.contentWidth,
      this.contentHeight,
      this.frameWidth,
      this.frameHeight,
    )
    const prevState = this.state
    this.state = [scale, this.el != null || this.state[1]]

    if (this.state[0] != prevState[0] || this.state[1] != prevState[1]) {
      this.observers.forEach((cb) => cb())
    }
  }

  setEl = (el: HTMLDivElement | null) => {
    if (this.el && this.resizeObserver) {
      this.resizeObserver.unobserve(this.el)
    }

    this.el = el
    if (el) {
      this.frameWidth = el.clientWidth
      this.frameHeight = el.clientHeight

      this.resizeObserver?.observe(el)

      this.update()
    }
  }

  setContentSize = (width?: number, height?: number) => {
    this.contentWidth = width
    this.contentHeight = height
  }

  subscribe = (cb: () => void): (() => void) => {
    this.observers.push(cb)
    return () => {
      const idx = this.observers.indexOf(cb)
      if (idx != -1) {
        this.observers.splice(idx, 1)
      }
    }
  }

  getSnapshot = (): readonly [number, boolean] => {
    return this.state
  }

  dispose() {
    this.resizeObserver?.disconnect()
  }
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
