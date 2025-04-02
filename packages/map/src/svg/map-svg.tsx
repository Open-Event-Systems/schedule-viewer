import { useProps } from "@mantine/core"
import clsx from "clsx"
import {
  ComponentPropsWithoutRef,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  setClickHandlers,
  setEventText,
  setFlags,
  setVendorIcons,
  setVendorNames,
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

export type MapSVGProps = Omit<ComponentPropsWithoutRef<"svg">, "children"> & {
  className?: string
  getSVGData: () => string
  level: string
  hiddenLayers?: Iterable<string>
  highlightId?: string | null
  vendors?: readonly MapSVGVendor[]
  flags?: Iterable<string>
  isometric?: boolean
  eventText?: ReadonlyMap<string, string>
  onSelectLocation?: (id: string | null) => void
}

export const MapSVG = forwardRef<SVGSVGElement, MapSVGProps>((props, ref) => {
  const {
    className,
    getSVGData,
    level,
    hiddenLayers = [],
    highlightId,
    vendors = [],
    flags = [],
    isometric = false,
    eventText,
    onSelectLocation,
    ...other
  } = useProps("MapSVG", {}, props)

  const [el, setEl] = useState<SVGSVGElement | null>(null)
  const isometricRef = useRef(isometric)
  isometricRef.current = isometric

  const [svgProps, innerHTML] = useMemo(() => {
    return getMapSVGProps(getSVGData())
  }, [getSVGData])

  useLayoutEffect(() => {
    if (el && innerHTML) {
      el.innerHTML = innerHTML
    }
  }, [el, innerHTML])

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
  useLayoutEffect(() => {
    if (el) {
      setVendorNames(el, vendors)
    }
  }, [el, vendors])

  // set flags
  useLayoutEffect(() => {
    if (el) {
      setFlags(el, flags)
    }
  }, [el, flags])

  // set event text
  useLayoutEffect(() => {
    if (el) {
      setEventText(el, eventText ?? new Map())
    }
  }, [el, eventText])

  return (
    <svg
      {...svgProps}
      {...other}
      ref={setRef}
      className={clsx("MapSVG-root", className, svgProps.className)}
    />
  )
})

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
