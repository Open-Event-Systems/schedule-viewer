import { useEffect } from "react"
import { mapSVGClassNames } from "../classes.js"

export const useMapFlagToggle = (
  el: SVGSVGElement | null,
  toggleFlag: (flag: string) => void,
) => {
  useEffect(() => {
    if (!el) {
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

    el.addEventListener("click", handler)

    return () => {
      el.removeEventListener("click", handler)
    }
  }, [el, toggleFlag])
}
