import { useEffect } from "react"
import { mapSVGClassNames } from "../classes.js"

export const useActiveArea = (
  svgEl: SVGSVGElement | null,
  id?: string | null,
) => {
  useEffect(() => {
    if (!id || !svgEl) {
      return
    }

    const areaCls = mapSVGClassNames.areaId(id)
    for (const el of svgEl.getElementsByClassName(areaCls)) {
      el.classList.add(mapSVGClassNames.active)
    }

    return () => {
      for (const el of svgEl.getElementsByClassName(areaCls)) {
        el.classList.remove(mapSVGClassNames.active)
      }
    }
  }, [svgEl, id])
}
