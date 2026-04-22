import type { MouseEvent } from "react"
import { useActiveArea } from "./area.js"
import { useClickHandler } from "./click.js"
import { useMapFlagClassNames, useMapFlagToggle } from "./flag.js"
import { useHideLayers } from "./layer.js"
import { useSetLocationInfo } from "./location-info.js"
import { useFlagTransitions } from "./transition.js"

export type MapSVGHookOptions = Readonly<{
  activeLocationId?: string | null
  hiddenLayerIds?: Iterable<string>
  flags?: Iterable<string>
  locationInfo?: Iterable<
    Readonly<{ id: string; title?: string; icon?: string }>
  >
  onToggleFlag?: (flag: string) => void
  onClickArea?: (clickId: string | null) => void
}>

export const useMapSVG = (
  svgEl: SVGSVGElement | null,
  options?: MapSVGHookOptions,
): Readonly<{
  flagClassNames: readonly string[]
  clickHandler: (e: MouseEvent) => void
}> => {
  const {
    activeLocationId,
    hiddenLayerIds,
    flags,
    locationInfo,
    onToggleFlag,
    onClickArea,
  } = options ?? {}

  useActiveArea(svgEl, activeLocationId)
  useHideLayers(svgEl, hiddenLayerIds)

  const flagClassNames = useMapFlagClassNames(flags)

  useSetLocationInfo(svgEl, locationInfo)
  useFlagTransitions(svgEl, flags)
  useMapFlagToggle(svgEl, onToggleFlag)

  const clickHandler = useClickHandler(onClickArea)

  return {
    flagClassNames,
    clickHandler,
  }
}
