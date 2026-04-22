import { useProps } from "@mantine/core"
import clsx from "clsx"
import {
  type ComponentPropsWithoutRef,
  memo,
  type Ref,
  useCallback,
  useState,
} from "react"
import { SVG, type SVGData } from "./svg.js"
import { useMapSVG } from "./hooks/map-svg.js"

export type MapSVGProps = {
  svgData: SVGData
  hiddenLayerIds?: Iterable<string>
  flags?: Iterable<string>
  activeLocationId?: string | null
  locationInfo?: Iterable<
    Readonly<{ id: string; title?: string; icon?: string }>
  >
  onToggleFlag?: (flag: string) => void
  onClickArea?: (id: string | null) => void
  ref?: Ref<SVGSVGElement>
} & Omit<ComponentPropsWithoutRef<"svg">, "children">

export const MapSVG = memo((props: MapSVGProps) => {
  const {
    ref,
    className,
    svgData,
    hiddenLayerIds,
    flags,
    activeLocationId,
    locationInfo,
    onToggleFlag,
    onClickArea,
    ...other
  } = useProps("MapSVG", {}, props)

  const [svgEl, setSVGEl] = useState<SVGSVGElement | null>(null)
  const setRef = useCallback(
    (el: SVGSVGElement | null) => {
      setSVGEl(el)

      if (typeof ref == "function") {
        ref(el)
      } else if (ref) {
        ref.current = el
      }
    },
    [setSVGEl, ref],
  )

  const { clickHandler, flagClassNames } = useMapSVG(svgEl, {
    activeLocationId,
    flags,
    hiddenLayerIds,
    locationInfo,
    onClickArea,
    onToggleFlag,
  })

  return (
    <SVG
      ref={setRef}
      svgData={svgData}
      className={clsx(
        "MapSVG-root",
        svgData?.props.className,
        flagClassNames,
        className,
      )}
      {...other}
      onClick={clickHandler}
    />
  )
})

MapSVG.displayName = "MapSVG"
