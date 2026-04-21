import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { mapSVGClassNames } from "../classes.js"
import { iterToArr } from "@open-event-systems/schedule-lib"

export type TransitionState = "off" | "forward" | "backward" | "on"

export const makeTransitionManager = (
  set: (transitionState: TransitionState) => void,
  initialState = false,
): [(newState: boolean) => void, () => void] => {
  let state = initialState
  let transitionState: TransitionState = initialState ? "on" : "off"
  let timeout: number | null = null

  const setState = (newState: boolean) => {
    if (newState == state) {
      return
    }

    state = newState

    if (newState) {
      // 1 30fps frame delay
      if (timeout != null) {
        window.clearTimeout(timeout)
      }
      timeout = window.setTimeout(() => {
        transitionState = "forward"
        set("forward")
      }, 34)
    } else {
      if (timeout != null) {
        window.clearTimeout(timeout)
        timeout = null
      }
      transitionState = "backward"
      set("backward")
    }
  }

  const onTransitionEnd = () => {
    if (transitionState == "forward") {
      transitionState = "on"
      set("on")
    } else if (transitionState == "backward") {
      transitionState = "off"
      set("off")
    }
  }

  set(transitionState)

  return [setState, onTransitionEnd]
}

export const makeFlagTransitionManager = (
  el: Element,
  initialState = false,
): [(state: boolean) => void, () => void] => {
  const setTransitionState = (transitionState: TransitionState) => {
    if (transitionState == "on") {
      el.classList.add(mapSVGClassNames.flagTransitionFinished)
    } else {
      el.classList.remove(mapSVGClassNames.flagTransitionFinished)
    }

    if (transitionState == "forward") {
      el.classList.add(mapSVGClassNames.flagTransitionForward)
    } else {
      el.classList.remove(mapSVGClassNames.flagTransitionForward)
    }

    if (transitionState == "backward") {
      el.classList.add(mapSVGClassNames.flagTransitionBackward)
    } else {
      el.classList.remove(mapSVGClassNames.flagTransitionBackward)
    }
  }

  const [setState, onTransitionEnd] = makeTransitionManager(
    setTransitionState,
    initialState,
  )

  const handleTransitionEnd = (e: TransitionEvent | AnimationEvent) => {
    if (e.currentTarget == e.target) {
      onTransitionEnd()
    }
  }

  if (el instanceof HTMLElement) {
    el.addEventListener("transitionend", handleTransitionEnd)
    el.addEventListener("animationend", handleTransitionEnd)
  } else if (el instanceof SVGElement) {
    el.addEventListener("transitionend", handleTransitionEnd)
    el.addEventListener("animationend", handleTransitionEnd)
  }

  return [
    setState,
    () => {
      if (el instanceof HTMLElement) {
        el.removeEventListener("transitionend", handleTransitionEnd)
        el.removeEventListener("animationend", handleTransitionEnd)
      } else if (el instanceof SVGElement) {
        el.removeEventListener("transitionend", handleTransitionEnd)
        el.removeEventListener("animationend", handleTransitionEnd)
      }
    },
  ]
}

export const useFlagTransitions = (
  rootEl: SVGSVGElement | null,
  flags?: Iterable<string>,
) => {
  const flagsArr = iterToArr(flags)
  const initialFlagsRef = useRef(flagsArr)

  const managers = useMemo(() => {
    const managers: [Element, (state: boolean) => void, () => void][] = []

    if (!rootEl) {
      return managers
    }

    for (const childEl of rootEl.getElementsByClassName(
      mapSVGClassNames.flagTransition,
    )) {
      managers.push([
        childEl,
        ...makeFlagTransitionManager(
          childEl,
          initialFlagsRef.current.some((f) =>
            childEl.classList.contains(mapSVGClassNames.flagTransitionId(f)),
          ),
        ),
      ])
    }

    return managers
  }, [rootEl, initialFlagsRef])

  useLayoutEffect(() => {
    managers.forEach(([el, set]) => {
      set(
        flagsArr.some((f) =>
          el.classList.contains(mapSVGClassNames.flagTransitionId(f)),
        ),
      )
    })
  }, [managers, flagsArr])

  useEffect(() => {
    return () => managers.forEach(([_el, _set, unsub]) => unsub())
  }, [managers])
}
