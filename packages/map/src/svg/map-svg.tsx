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
import {
  createForeignTextObject,
  setClickHandlers,
  setVendorIcons,
  updateHighlight,
  updateIsometric,
  updateIsometricDelayed,
  updateLayers,
  updateLevel,
} from "./utils.js"

export type MapSVGVendor = Readonly<{
  location: string
  name: string
  icon?: string
}>

export type MapSVGProps = ComponentPropsWithoutRef<"svg"> & {
  level: string
  hiddenLayers?: Iterable<string>
  highlightId?: string | null
  vendors?: readonly MapSVGVendor[]
  isometric?: boolean
  onSelectLocation?: (id: string | null) => void
}

export const MapSVG = forwardRef<SVGSVGElement, MapSVGProps>((props, ref) => {
  const {
    className,
    level,
    hiddenLayers = [],
    highlightId,
    vendors = [],
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
    if (el) {
      updateLevel(el, level)
    }
  }, [el, level])

  // Update hidden layers
  useLayoutEffect(() => {
    if (el) {
      updateLayers(el, hiddenLayers)
    }
  }, [el, hiddenLayers])

  // Update highlight
  useLayoutEffect(() => {
    if (el) {
      updateHighlight(el, highlightId)
    }
  }, [el, highlightId])

  // Update isometric
  useLayoutEffect(() => {
    if (el) {
      updateIsometric(el, isometric)
    }
  }, [el, isometric])

  // Delayed isometric handling
  useLayoutEffect(() => {
    if (el) {
      return updateIsometricDelayed(el, isometricRef)
    }
  }, [el])

  // Set click handlers
  useLayoutEffect(() => {
    if (el) {
      setClickHandlers(el, onSelectLocation)
    }
  }, [el, onSelectLocation])

  // set vendor icons
  useLayoutEffect(() => {
    if (el) {
      setVendorIcons(el, vendors)
    }
  }, [el, vendors])

  // set vendor names
  // useLayoutEffect(() => {
  //   const els = el?.getElementsByClassName(MAP_CLASSES.vendorName) ?? []
  //   for (const el of els) {
  //     el.innerHTML = ""
  //   }

  //   for (const vendor of vendors) {
  //     const els =
  //       el?.getElementsByClassName(
  //         getMapClass(MAP_CLASSES.vendorNamePrefix, vendor.location)
  //       ) ?? []
  //     for (const el of els) {
  //       el.innerHTML = vendor.name
  //     }
  //   }
  // }, [el, vendors])

  // useLayoutEffect(() => {
  //   if (el) {
  //     const replace = el.getElementById("test")
  //     const textEl = createForeignTextObject(replace as SVGElement)
  //     textEl.classList.add("Map-foreignText")
  //     textEl.innerHTML = "Hello there really long text how will this work out"
  //   }
  // }, [el])

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
