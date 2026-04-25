import { useCallback, type MouseEvent } from "react"
import { mapSVGClassNames } from "../classes.js"

export const useClickHandler = (
  onClick?: (id: string | null) => void,
): ((e: MouseEvent) => void) => {
  return useCallback(
    (e: MouseEvent) => {
      if (!onClick) {
        return
      }

      if (
        !(e.target instanceof HTMLElement || e.target instanceof SVGElement)
      ) {
        return
      }

      const targetEl = getForeignObjectTarget(e.target) ?? e.target

      for (const c of targetEl.classList) {
        const clickId = mapSVGClassNames.clickId.parse(c)
        if (clickId) {
          onClick(clickId)
          break
        }
      }
    },
    [onClick],
  )
}

const getForeignObjectTarget = (targetEl: Element) => {
  if (isForeignObjectTextElement(targetEl) && targetEl.parentElement) {
    // Clicked on a .foreignObjectText div, use the parent foreignObject to determine area ID
    return targetEl.parentElement
  } else if (
    targetEl.parentElement &&
    isForeignObjectTextElement(targetEl.parentElement) &&
    targetEl.parentElement.parentElement
  ) {
    // Clicked on a child of a .foreignObjectText div, go up two levels
    return targetEl.parentElement.parentElement
  }
}

const isForeignObjectTextElement = (el: Element) => {
  return el.classList.contains(mapSVGClassNames.foreignObjectText)
}
