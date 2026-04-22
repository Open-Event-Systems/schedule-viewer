import { useEffect, useMemo } from "react"
import { mapSVGClassNames } from "../classes.js"
import { iterToArr } from "@open-event-systems/schedule-lib"

export const useMapFlagClassNames = (
  flags?: Iterable<string>,
): readonly string[] => {
  return useMemo(() => {
    return iterToArr(flags).map((f) => mapSVGClassNames.flagId(f))
  }, [flags])
}

export const useMapFlagToggle = (
  svgEl: SVGSVGElement | null,
  toggleFlag: (flag: string) => void,
) => {
  useEffect(() => {
    if (!svgEl) {
      return
    }

    const handler = (e: MouseEvent) => {
      if (
        e.target instanceof SVGElement &&
        e.target.classList.contains(mapSVGClassNames.flagToggle)
      ) {
        const prefix = mapSVGClassNames.flagToggleId("")
        e.target.classList.forEach((c) => {
          if (c.startsWith(prefix)) {
            const id = c.slice(prefix.length)
            toggleFlag(id)
          }
        })
      }
    }

    svgEl.addEventListener("click", handler)

    return () => {
      svgEl.removeEventListener("click", handler)
    }
  }, [svgEl, toggleFlag])
}
