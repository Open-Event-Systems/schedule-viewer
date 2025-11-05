import { useProps } from "@mantine/core"
import clsx from "clsx"
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react"
import type { SVGData } from "./svg.js"
import { mapSVGClassNames } from "./classes.js"

export type MapSVGProps = {
  svgData: SVGData
  hiddenLayers?: Iterable<string>
  flags?: Iterable<string>
  activeLocation?: string
  locationInfo?: Iterable<
    Readonly<{ id: string; title?: string; icon?: string }>
  >
  onClickArea?: (id: string | undefined) => void
} & Omit<ComponentPropsWithoutRef<"svg">, "children">

export const MapSVG = forwardRef<SVGSVGElement, MapSVGProps>((props, ref) => {
  const {
    className,
    svgData,
    hiddenLayers,
    flags,
    activeLocation,
    locationInfo,
    onClickArea,
    ...other
  } = useProps("MapSVG", {}, props)

  const svgRef = useRef<SVGSVGElement | null>(null)
  const setRef = useCallback(
    (el: SVGSVGElement | null) => {
      svgRef.current = el

      if (el) {
        el.innerHTML = svgData.innerHTML
        initSVG(el)
      }

      if (typeof ref == "function") {
        ref(el)
      } else if (ref) {
        ref.current = el
      }
    },
    [ref],
  )

  useLayoutEffect(() => {
    if (svgRef.current) {
      updateActiveArea(svgRef.current, activeLocation)
    }
  }, [activeLocation])

  useLayoutEffect(() => {
    if (svgRef.current) {
      updateLayers(svgRef.current, hiddenLayers ?? [])
    }
  }, [hiddenLayers])

  useLayoutEffect(() => {
    if (svgRef.current) {
      updateFlags(svgRef.current, flags ?? [])
    }
  }, [flags])

  useLayoutEffect(() => {
    if (svgRef.current) {
      updateLocationText(svgRef.current, locationInfo ?? [])
      updateLocationIcon(svgRef.current, locationInfo ?? [])
    }
  }, [locationInfo])

  const clickHandler = useCallback(
    (e: MouseEvent<SVGElement>) => {
      const base = mapSVGClassNames.clickId("")
      if (onClickArea) {
        if (e.target instanceof SVGElement) {
          const clsIds = [...e.target.classList]
            .filter((cls) => cls.startsWith(base))
            .map((cls) => cls.substring(base.length))
          if (clsIds[0]) {
            onClickArea(clsIds[0])
          } else {
            onClickArea(undefined)
          }
        } else {
          onClickArea(undefined)
        }
      }
    },
    [onClickArea],
  )

  return (
    <svg
      ref={setRef}
      {...svgData.props}
      className={clsx("MapSVG-root", svgData?.props.className, className)}
      {...other}
      onClick={clickHandler}
    />
  )
})

MapSVG.displayName = "MapSVG"

const initSVG = (svg: SVGSVGElement) => {
  for (const el of svg.getElementsByClassName(mapSVGClassNames.layer)) {
    removeInlineDisplay(el)
  }
  for (const el of svg.getElementsByClassName(mapSVGClassNames.locationTitle)) {
    if (el instanceof SVGRectElement) {
      replaceWithForeignTextObject(el)
    }
  }
}

const updateActiveArea = (svg: SVGSVGElement, id?: string) => {
  const activeCls = id ? mapSVGClassNames.areaId(id) : undefined
  for (const el of svg.getElementsByClassName(mapSVGClassNames.area)) {
    if (activeCls && el.classList.contains(activeCls)) {
      el.classList.add(mapSVGClassNames.active)
    } else {
      el.classList.remove(mapSVGClassNames.active)
    }
  }
}

const updateLayers = (svg: SVGSVGElement, hidden: Iterable<string>) => {
  const hiddenClasses = [...hidden].map((id) => mapSVGClassNames.layerId(id))
  for (const el of svg.getElementsByClassName(mapSVGClassNames.layer)) {
    if (hiddenClasses.some((cls) => el.classList.contains(cls))) {
      el.classList.add(mapSVGClassNames.hidden)
    } else {
      el.classList.remove(mapSVGClassNames.hidden)
    }
  }
}

const updateFlags = (svg: SVGSVGElement, flags: Iterable<string>) => {
  const toRemove = [...svg.classList].filter((cls) =>
    cls.startsWith(mapSVGClassNames.flagId("")),
  )
  const toAdd = [...flags].map((f) => mapSVGClassNames.flagId(f))
  toRemove.forEach((cls) => svg.classList.remove(cls))
  svg.classList.add(...toAdd)
}

const updateLocationText = (
  svg: SVGSVGElement,
  locationInfo: Iterable<
    Readonly<{ id: string; title?: string; icon?: string }>
  >,
) => {
  for (const el of svg.getElementsByClassName(mapSVGClassNames.locationTitle)) {
    if (el instanceof SVGElement) {
      setLocationText(el, "")
    }
  }

  for (const info of locationInfo) {
    for (const el of svg.getElementsByClassName(
      mapSVGClassNames.locationTitleId(info.id),
    )) {
      if (info.title && el instanceof SVGElement) {
        setLocationText(el, info.title)
      }
    }
  }
}

const updateLocationIcon = (
  svg: SVGSVGElement,
  locationInfo: Iterable<
    Readonly<{ id: string; title?: string; icon?: string }>
  >,
) => {
  for (const el of svg.getElementsByClassName(mapSVGClassNames.locationIcon)) {
    if (el instanceof SVGElement) {
      setLocationIcon(el)
    }
  }

  for (const info of locationInfo) {
    for (const el of svg.getElementsByClassName(
      mapSVGClassNames.locationTitleId(info.id),
    )) {
      if (info.icon && el instanceof SVGElement) {
        setLocationIcon(el, info.icon)
      }
    }
  }
}

const removeInlineDisplay = (el: Element) => {
  if (el instanceof SVGElement && el.style.display) {
    el.style.display = ""
  }
}

const setLocationIcon = (el: SVGElement, icon?: string) => {
  if (icon) {
    el.classList.remove(mapSVGClassNames.empty)

    if (el instanceof SVGImageElement) {
      el.setAttributeNS("http://www.w3.org/1999/xlink", "href", icon)
    }
  } else {
    el.classList.add(mapSVGClassNames.empty)
    if (el instanceof SVGImageElement) {
      el.setAttributeNS("http://www.w3.org/1999/xlink", "href", "data:,")
    }
  }
}

const setLocationText = (el: SVGElement, text: string) => {
  if (el instanceof SVGForeignObjectElement) {
    const textEls = el.getElementsByClassName(
      mapSVGClassNames.foreignObjectText,
    )
    if (textEls[0]) {
      textEls[0].innerHTML = ""
    }
    const textNode = document.createTextNode(text)
    textEls[0]?.appendChild(textNode)
  } else if (el instanceof SVGTextElement || el instanceof SVGTSpanElement) {
    el.innerHTML = ""
    const textNode = document.createTextNode(text)
    el.appendChild(textNode)
  } else if (el instanceof SVGGElement) {
    // don't directly change groups
  } else {
    console.warn("Cannot replace text on this element", el)
  }

  if (text == "") {
    el.classList.add(mapSVGClassNames.empty)
  } else {
    el.classList.remove(mapSVGClassNames.empty)
  }
}

const replaceWithForeignTextObject = (
  replaceEl: SVGElement,
): HTMLDivElement => {
  const parent = replaceEl.parentElement
  const div = document.createElement("div")
  div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml")
  div.classList.add(mapSVGClassNames.foreignObjectText)

  if (!(parent instanceof SVGElement)) {
    return div
  }

  const x = replaceEl.getAttribute("x") ?? ""
  const y = replaceEl.getAttribute("y") ?? ""
  const transform = replaceEl.getAttribute("transform") ?? ""
  const width = replaceEl.getAttribute("width") ?? ""
  const height = replaceEl.getAttribute("height") ?? ""
  const fObj = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject",
  )
  fObj.appendChild(div)
  fObj.setAttribute("x", x)
  fObj.setAttribute("y", y)
  fObj.setAttribute("width", width)
  fObj.setAttribute("height", height)
  fObj.setAttribute("transform", transform)

  replaceEl.classList.forEach((cn) => fObj.classList.add(cn))

  parent.replaceChild(fObj, replaceEl)
  return div
}
