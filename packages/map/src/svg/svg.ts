import type { ComponentPropsWithoutRef } from "react"

export type SVGData = Readonly<{
  props: Readonly<Omit<ComponentPropsWithoutRef<"svg">, "children">>
  innerHTML: string
}>

/**
 * Parse {@link SVGData} from a string representing an SVG document.
 */
export const parseSVGData = (svgString: string): SVGData => {
  const tmpDiv = document.createElement("div")
  tmpDiv.innerHTML = svgString
  const svgEl = tmpDiv.getElementsByTagName("svg")[0]

  if (!svgEl) {
    throw new Error("Could not parse SVG document")
  }

  const props: Record<string, string> = {}

  for (const attr of svgEl.getAttributeNames()) {
    const val = svgEl.getAttribute(attr)

    if (val != null) {
      const fixed = fixNSAttr(attr)
      props[fixed] = val
    }
  }

  return {
    innerHTML: svgEl.innerHTML,
    props: props as ComponentPropsWithoutRef<"svg">,
  }
}

const nsAttrMap = {
  "xml:space": "xmlSpace",
  "xmlns:xlink": "xmlnsXlink",
} as Readonly<Record<string, string | undefined>>

const fixNSAttr = (s: string): string => {
  return nsAttrMap[s] ?? s
}
