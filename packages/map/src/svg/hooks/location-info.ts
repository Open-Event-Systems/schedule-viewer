import { useEffect, useLayoutEffect } from "react"
import { mapSVGClassNames } from "../classes.js"
import { removeInlineDisplay } from "./util.js"

export const useSetLocationInfo = (
  svgEl: SVGSVGElement | null,
  locationInfo?: Iterable<
    Readonly<{ id: string; title?: string; icon?: string }>
  >,
) => {
  useLayoutEffect(() => {
    if (!svgEl) {
      return
    }

    for (const el of svgEl.getElementsByClassName(
      mapSVGClassNames.locationTitle,
    )) {
      if (el instanceof SVGRectElement) {
        replaceWithForeignTextObject(el)
      }
    }
  }, [svgEl])

  useEffect(() => {
    if (!svgEl) {
      return
    }

    for (const el of svgEl.getElementsByClassName(
      mapSVGClassNames.locationTitle,
    )) {
      if (el instanceof SVGElement) {
        removeInlineDisplay(el)
        setLocationText(el, null)
      }
    }

    for (const el of svgEl.getElementsByClassName(
      mapSVGClassNames.locationIcon,
    )) {
      if (el instanceof SVGElement) {
        removeInlineDisplay(el)
        setLocationIcon(el, null)
      }
    }

    for (const locInfo of locationInfo ?? []) {
      const titleCls = mapSVGClassNames.locationTitleId(locInfo.id)
      for (const el of svgEl.getElementsByClassName(titleCls)) {
        if (locInfo.title && el instanceof SVGElement) {
          setLocationText(el, locInfo.title)
        }
      }

      const iconCls = mapSVGClassNames.locationIconId(locInfo.id)
      for (const el of svgEl.getElementsByClassName(iconCls)) {
        if (locInfo.icon && el instanceof SVGElement) {
          setLocationIcon(el, locInfo.icon)
        }
      }
    }
  }, [svgEl, locationInfo])
}

const setLocationIcon = (el: SVGElement, icon?: string | null) => {
  if (icon) {
    el.classList.remove(mapSVGClassNames.empty)

    if (el instanceof SVGImageElement) {
      el.setAttribute("href", icon)
    }
  } else {
    el.classList.add(mapSVGClassNames.empty)
    if (el instanceof SVGImageElement) {
      el.setAttribute("href", "data:,")
    }
  }
}

const setLocationText = (el: SVGElement, text?: string | null) => {
  if (el instanceof SVGForeignObjectElement) {
    const textEl = el.getElementsByClassName(
      mapSVGClassNames.foreignObjectText,
    )[0]

    if (textEl) {
      textEl.innerHTML = ""

      if (text) {
        const spanNode = document.createElement("span")
        const textNode = document.createTextNode(text)
        spanNode.appendChild(textNode)
        textEl?.appendChild(spanNode)
      }
    }
  } else if (el instanceof SVGTextElement || el instanceof SVGTSpanElement) {
    el.innerHTML = ""

    if (text) {
      const textNode = document.createTextNode(text)
      el.appendChild(textNode)
    }
  } else if (el instanceof SVGGElement) {
    // don't directly change groups
  } else {
    console.warn("Cannot replace text on this element", el)
  }

  if (!text) {
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
