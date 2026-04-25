import { iterToArr } from "@open-event-systems/schedule-lib"
import { useLayoutEffect } from "react"
import { mapSVGClassNames } from "../classes.js"
import { removeInlineDisplay } from "./util.js"

export const useHideLayers = (
  svgEl: SVGSVGElement | null,
  hiddenLayerIds?: Iterable<string> | null,
) => {
  useLayoutEffect(() => {
    if (!svgEl) {
      return
    }

    for (const el of svgEl.getElementsByClassName(mapSVGClassNames.layer)) {
      removeInlineDisplay(el)
    }
  }, [svgEl])

  useLayoutEffect(() => {
    if (!svgEl) {
      return
    }

    const hiddenLayerIdsArr = iterToArr(hiddenLayerIds)

    const hiddenClasses = hiddenLayerIdsArr.map(mapSVGClassNames.layerId)
    for (const el of svgEl.getElementsByClassName(mapSVGClassNames.layer)) {
      if (hiddenClasses.some((c) => el.classList.contains(c))) {
        el.classList.add(mapSVGClassNames.hidden)
      } else {
        el.classList.remove(mapSVGClassNames.hidden)
      }
    }
  }, [svgEl, hiddenLayerIds])
}
