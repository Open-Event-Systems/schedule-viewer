import { memo, useMemo, type ComponentPropsWithoutRef, type Ref } from "react"

export type SVGData = Readonly<{
  props: Readonly<Omit<ComponentPropsWithoutRef<"svg">, "children">>
  innerHTML: string
}>

export type SVGProps = ComponentPropsWithoutRef<"svg"> & {
  svgData: SVGData
  ref?: Ref<SVGSVGElement>
}

/**
 * Renders a SVG element from a {@link SVGData} object.
 */
export const SVG = memo((props: SVGProps) => {
  const { svgData, ref, ...otherSvgProps } = props

  // memoize this object so a re-render doesn't replace the inner html
  const htmlProps = useMemo(() => ({ __html: svgData.innerHTML }), [svgData])

  return (
    <svg
      ref={ref}
      // Fully replace the element if the svg data changes
      key={svgData.innerHTML}
      {...svgData.props}
      {...otherSvgProps}
      dangerouslySetInnerHTML={htmlProps}
    />
  )
})

SVG.displayName = "SVG"

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
