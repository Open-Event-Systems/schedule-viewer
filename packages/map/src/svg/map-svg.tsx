import { useProps } from "@mantine/core"
import clsx from "clsx"
import {
  ComponentPropsWithoutRef,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { getIDFromMapClass, getMapClass, MAP_CLASSES } from "../map-classes.js"

export type MapSVGProps = ComponentPropsWithoutRef<"svg"> & {
  level: string
  hiddenLayers?: Iterable<string>
  highlightId?: string | null
  isometric?: boolean
  onSelectLocation?: (id: string | null) => void
}

export const MapSVG = forwardRef<SVGSVGElement, MapSVGProps>((props, ref) => {
  const {
    className,
    level,
    hiddenLayers = [],
    highlightId,
    isometric = false,
    onSelectLocation,
    ...other
  } = useProps("MapSVG", {}, props)

  const [el, setEl] = useState<SVGSVGElement | null>(null)
  const isometricRef = useRef(isometric)
  isometricRef.current = isometric

  const setRef = useCallback(
    (el: SVGSVGElement | null) => {
      setEl(el)
      if (typeof ref == "function") {
        ref(el)
      } else if (ref && typeof ref == "object") {
        ref.current = el
      }
    },
    [ref],
  )

  // Update level
  useLayoutEffect(() => {
    const levelCls = getMapClass(MAP_CLASSES.levelPrefix, level)
    const els = el?.getElementsByClassName(MAP_CLASSES.level) ?? []
    for (const el of els) {
      removeInlineDisplay(el)
      if (el.classList.contains(levelCls)) {
        el.classList.add(MAP_CLASSES.visible)
      } else {
        el.classList.remove(MAP_CLASSES.visible)
      }
    }
  }, [el, level])

  // Update hidden layers
  useLayoutEffect(() => {
    const hiddenClasses = Array.from(hiddenLayers, (layer) =>
      getMapClass(MAP_CLASSES.layerPrefix, layer),
    )
    const els = el?.getElementsByClassName(MAP_CLASSES.layer) ?? []
    for (const el of els) {
      removeInlineDisplay(el)
      if (hiddenClasses.some((cls) => el.classList.contains(cls))) {
        el.classList.add(MAP_CLASSES.hidden)
      } else {
        el.classList.remove(MAP_CLASSES.hidden)
      }
    }
  }, [el, hiddenLayers])

  // Update highlight
  useLayoutEffect(() => {
    const highlightCls = highlightId
      ? getMapClass(MAP_CLASSES.areaPrefix, highlightId)
      : null
    const els = el?.getElementsByClassName(MAP_CLASSES.area) ?? []
    for (const el of els) {
      if (highlightCls && el.classList.contains(highlightCls)) {
        el.classList.add(MAP_CLASSES.highlight)
      } else {
        el.classList.remove(MAP_CLASSES.highlight)
      }
    }
  }, [el, highlightId])

  // Update isometric
  useLayoutEffect(() => {
    if (el && isometric) {
      el.classList.add(MAP_CLASSES.isometric)
      window.setTimeout(() => {
        el.classList.add(MAP_CLASSES.isometricTransform)
      }, 50)
    } else if (el && !isometric) {
      el.classList.remove(MAP_CLASSES.isometricTransform)
    }
  }, [el, isometric])

  // Delayed isometric handling
  useLayoutEffect(() => {
    if (el) {
      const handler = () => {
        if (!isometricRef.current) {
          el.classList.remove(MAP_CLASSES.isometric)
        }
      }
      el.addEventListener("transitionend", handler)
      return () => {
        el.removeEventListener("transitionend", handler)
      }
    }
  }, [el])

  // Set click handlers
  useLayoutEffect(() => {
    const cleanup: (() => void)[] = []
    const els = el?.getElementsByClassName(MAP_CLASSES.click) ?? []
    for (const el of els) {
      const clickId = Array.from(el.classList, (cls) =>
        getIDFromMapClass(MAP_CLASSES.clickPrefix, cls),
      ).find((cls) => !!cls)
      if (clickId && el instanceof SVGElement) {
        const handler = (e: MouseEvent) => {
          e.stopPropagation()
          onSelectLocation && onSelectLocation(clickId)
        }
        el.addEventListener("click", handler)
        cleanup.push(() => el.removeEventListener("click", handler))
      }
    }

    if (el) {
      const handler = (e: MouseEvent) => {
        e.stopPropagation()
        onSelectLocation && onSelectLocation(null)
      }
      el.addEventListener("click", handler)
      cleanup.push(() => el.removeEventListener("click", handler))
    }

    return () => {
      for (const f of cleanup) {
        f()
      }
    }
  }, [el, onSelectLocation])

  return (
    <svg className={clsx("MapSVG-root", className)} ref={setRef} {...other} />
  )
})

const removeInlineDisplay = (el: Element) => {
  if (el instanceof HTMLElement || el instanceof SVGElement) {
    el.style.display = ""
  }
}

export const getMapSVGProps = (
  svgData: string,
): [ComponentPropsWithoutRef<"svg">, string] => {
  const tmp = document.createElement("div")
  tmp.innerHTML = svgData
  const svg = tmp.getElementsByTagName("svg")[0]

  const props: Record<string, unknown> = {}

  for (const attr of svg.getAttributeNames()) {
    const val = svg.getAttribute(attr)
    if (val != null) {
      props[attr] = val
    }
  }

  return [props as ComponentPropsWithoutRef<"svg">, svg.innerHTML]
}
