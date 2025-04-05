import { RefObject } from "react"
import { getIDFromMapClass, getMapClass, MAP_CLASSES } from "../map-classes.js"
import { MapSVGVendor } from "./map-svg.js"

export const updateLevel = (el: SVGSVGElement, level: string) => {
  const levelCls = getMapClass(MAP_CLASSES.levelPrefix, level)
  const els = el.getElementsByClassName(MAP_CLASSES.level)
  for (const el of els) {
    removeInlineDisplay(el)
    if (el.classList.contains(levelCls)) {
      el.classList.add(MAP_CLASSES.visible)
    } else {
      el.classList.remove(MAP_CLASSES.visible)
    }
  }
}

export const updateLayers = (
  el: SVGSVGElement,
  hiddenLayers: Iterable<string>,
) => {
  const hiddenClasses = Array.from(hiddenLayers, (layer) =>
    getMapClass(MAP_CLASSES.layerPrefix, layer),
  )
  const els = el.getElementsByClassName(MAP_CLASSES.layer)
  for (const el of els) {
    removeInlineDisplay(el)
    if (hiddenClasses.some((cls) => el.classList.contains(cls))) {
      el.classList.add(MAP_CLASSES.hidden)
    } else {
      el.classList.remove(MAP_CLASSES.hidden)
    }
  }
}

export const updateHighlight = (
  el: SVGSVGElement,
  highlightId: string | null | undefined,
) => {
  const highlightCls = highlightId
    ? getMapClass(MAP_CLASSES.areaPrefix, highlightId)
    : null
  const els = el.getElementsByClassName(MAP_CLASSES.area)
  for (const el of els) {
    if (highlightCls && el.classList.contains(highlightCls)) {
      el.classList.add(MAP_CLASSES.highlight)
    } else {
      el.classList.remove(MAP_CLASSES.highlight)
    }
  }
}

export const fixDisplayTransitionHidden = (el: SVGSVGElement) => {
  for (const c of el.getElementsByClassName(
    MAP_CLASSES.isometricTransitionHidden,
  )) {
    removeInlineDisplay(c)
  }
}

export const updateIsometric = (el: SVGSVGElement, isometric: boolean) => {
  if (isometric) {
    el.classList.add(MAP_CLASSES.isometric)
    window.setTimeout(() => {
      el.classList.add(MAP_CLASSES.isometricTransform)
    }, 50)
  } else {
    el.classList.remove(MAP_CLASSES.isometricTransform)
    el.classList.remove(MAP_CLASSES.isometricTransitionFinished)
  }
}

export const updateIsometricDelayed = (
  el: SVGSVGElement,
  currentRef: RefObject<boolean>,
): (() => void) => {
  const handler = () => {
    if (!currentRef.current) {
      el.classList.remove(MAP_CLASSES.isometric)
    } else {
      el.classList.add(MAP_CLASSES.isometricTransitionFinished)
    }
  }
  el.addEventListener("transitionend", handler)
  return () => {
    el.removeEventListener("transitionend", handler)
  }
}

export const setClickHandlers = (
  el: SVGSVGElement,
  onSelectLocation?: (id: string | null) => void,
): (() => void) => {
  const cleanup: (() => void)[] = []
  const els = el.getElementsByClassName(MAP_CLASSES.click)
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

  const handler = (e: MouseEvent) => {
    e.stopPropagation()
    onSelectLocation && onSelectLocation(null)
  }
  el.addEventListener("click", handler)
  cleanup.push(() => el.removeEventListener("click", handler))

  return () => {
    for (const f of cleanup) {
      f()
    }
  }
}

export const setVendorIcons = (
  el: SVGSVGElement,
  vendors: readonly MapSVGVendor[],
) => {
  const els = el.getElementsByClassName(MAP_CLASSES.vendorIcon)
  for (const el of els) {
    removeInlineDisplay(el)
  }

  for (const vendor of vendors) {
    const els = el.getElementsByClassName(
      getMapClass(MAP_CLASSES.vendorIconPrefix, vendor.location),
    )
    for (const el of els) {
      if (vendor.icon) {
        el.classList.add(MAP_CLASSES.visible)
        if (el.tagName == "image") {
          el.setAttributeNS("http://www.w3.org/1999/xlink", "href", vendor.icon)
        }
      } else {
        el.classList.remove(MAP_CLASSES.visible)
      }
    }
  }
}

export const setVendorNames = (
  el: SVGSVGElement,
  vendors: readonly MapSVGVendor[],
) => {
  const els = el.getElementsByClassName(MAP_CLASSES.vendorName)
  for (const el of els) {
    removeInlineDisplay(el)
  }

  for (const vendor of vendors) {
    const els = el.getElementsByClassName(
      getMapClass(MAP_CLASSES.vendorNamePrefix, vendor.location),
    )
    for (const el of els) {
      el.classList.add(MAP_CLASSES.visible)
      if (el instanceof SVGElement) {
        setElementText(el, vendor.name)
      }
    }
  }
}

export const setFlags = (el: SVGSVGElement, flags: Iterable<string>) => {
  const updated = [...flags]
  for (const cls of el.classList) {
    const flagId = getIDFromMapClass(MAP_CLASSES.flagPrefix, cls)
    if (!flagId) {
      updated.push(cls)
    }
  }
  el.classList.remove(...el.classList)
  el.classList.add(
    ...updated.map((cls) => getMapClass(MAP_CLASSES.flagPrefix, cls)),
  )
}

export const setEventText = (
  el: SVGSVGElement,
  eventMap: ReadonlyMap<string, string>,
) => {
  const els = el.getElementsByClassName(MAP_CLASSES.eventName)
  for (const el of els) {
    removeInlineDisplay(el)
    if (!(el instanceof SVGForeignObjectElement)) {
      createForeignTextObject(el as SVGElement)
    }
  }
  for (const [locId, title] of eventMap.entries()) {
    const className = getMapClass(MAP_CLASSES.eventNamePrefix, locId)
    const textEls = el.getElementsByClassName(className)
    for (const textEl of textEls) {
      const htmlTextEls = textEl.getElementsByClassName(
        MAP_CLASSES.foreignObjectText,
      )
      if (htmlTextEls.length > 0) {
        htmlTextEls[0].innerHTML = title
      }
    }
  }
}

const setElementText = (el: SVGElement, text: string) => {
  if (el instanceof SVGForeignObjectElement) {
    const textEls = el.getElementsByClassName(MAP_CLASSES.foreignObjectText)
    if (textEls.length > 0) {
      textEls[0].innerHTML = ""
      const textNode = document.createTextNode(text)
      textEls[0].appendChild(textNode)
    }
  } else if (el instanceof SVGTextElement || el instanceof SVGTSpanElement) {
    el.innerHTML = ""
    const textNode = document.createTextNode(text)
    el.appendChild(textNode)
  } else if (el instanceof SVGRectElement) {
    const objTextEl = createForeignTextObject(el)
    const textNode = document.createTextNode(text)
    objTextEl.appendChild(textNode)
  } else {
    console.warn("Cannot replace text on this element", el)
  }
}

export const createForeignTextObject = (
  replaceEl: SVGElement,
): HTMLDivElement => {
  const parent = replaceEl.parentElement
  const div = document.createElement("div")
  div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml")
  div.classList.add(MAP_CLASSES.foreignObjectText)

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

const removeInlineDisplay = (el: Element) => {
  if (el instanceof HTMLElement || el instanceof SVGElement) {
    el.style.removeProperty("display")
  }
}
