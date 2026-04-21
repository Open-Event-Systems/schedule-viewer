import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { mapSVGClassNames } from "./classes.js"
import { iterToArr } from "@open-event-systems/schedule-lib"

export type TransitionState = "off" | "forward" | "backward" | "on"

export class TransitionManager {
  private state: boolean
  private _transitionState: TransitionState
  private observers = new Set<() => void>()
  private timeout: number | null = null

  constructor(initialState = false) {
    this.state = initialState
    this._transitionState = initialState ? "on" : "off"
  }

  get transitionState(): TransitionState {
    return this._transitionState
  }

  setState = (state: boolean) => {
    if (state == this.state) {
      return
    }

    this.state = state

    if (state) {
      if (this.timeout != null) {
        window.clearTimeout(this.timeout)
      }

      // 1 30fps frame delay
      this.timeout = window.setTimeout(() => {
        this._transitionState = "forward"
        this.notify()
      }, 34)
    } else {
      if (this.timeout != null) {
        window.clearTimeout(this.timeout)
        this.timeout = null
      }
      this._transitionState = "backward"
    }

    this.notify()
  }

  onTransitionEnd = () => {
    if (this._transitionState == "forward") {
      this._transitionState = "on"
    } else if (this._transitionState == "backward") {
      this._transitionState = "off"
    }
  }

  subscribe = (cb: () => void): (() => void) => {
    this.observers.add(cb)

    return () => {
      this.observers.delete(cb)
    }
  }

  private notify() {
    this.observers.forEach((o) => o())
  }
}

export class FlagTransitionManager {
  private flagIds: string[] = []
  private manager: TransitionManager
  private unsubscribe: () => void
  private state: boolean

  constructor(
    private el: Element,
    initialFlags?: Iterable<string>,
  ) {
    const prefix = mapSVGClassNames.flagTransitionId("")
    for (const cls of el.classList) {
      if (cls.startsWith(prefix)) {
        this.flagIds.push(cls.slice(prefix.length))
      }
    }

    const initialFlagsArr = iterToArr(initialFlags)

    this.state = this.flagIds.some((f) => initialFlagsArr.includes(f))
    this.manager = new TransitionManager(this.state)

    if (el instanceof HTMLElement) {
      el.addEventListener("transitionend", this.onTransitionEnd)
    } else if (el instanceof SVGElement) {
      el.addEventListener("transitionend", this.onTransitionEnd)
    }

    this.unsubscribe = this.manager.subscribe(this.onUpdate)
  }

  private onTransitionEnd = (e: TransitionEvent) => {
    if (e.target == e.currentTarget) {
      this.manager.onTransitionEnd()
    }
  }

  update = (flags?: Iterable<string>) => {
    const flagsArr = iterToArr(flags)
    this.state = this.flagIds.some((f) => flagsArr.includes(f))
    this.manager.setState(this.state)
  }

  private onUpdate = () => {
    const curTransState = this.manager.transitionState

    if (curTransState == "on") {
      this.el.classList.add(mapSVGClassNames.flagTransitionFinished)
    } else {
      this.el.classList.remove(mapSVGClassNames.flagTransitionFinished)
    }

    if (curTransState == "forward" || curTransState == "backward") {
      this.el.classList.add(mapSVGClassNames.flagTransform)
    } else {
      this.el.classList.remove(mapSVGClassNames.flagTransform)
    }
  }

  dispose() {
    if (this.el instanceof HTMLElement) {
      this.el.removeEventListener("transitionend", this.onTransitionEnd)
    } else if (this.el instanceof SVGElement) {
      this.el.removeEventListener("transitionend", this.onTransitionEnd)
    }
    this.unsubscribe()
  }
}

export const useFlagTransitions = (
  el: Element | null,
  flags?: Iterable<string>,
) => {
  const initialFlagsRef = useRef(flags)
  const elManagers = useMemo(() => {
    const mgrs: FlagTransitionManager[] = []
    if (!el) {
      return mgrs
    }

    for (const childEl of el.getElementsByClassName(
      mapSVGClassNames.flagTransition,
    )) {
      mgrs.push(new FlagTransitionManager(childEl, initialFlagsRef.current))
    }

    return mgrs
  }, [el, initialFlagsRef])

  useLayoutEffect(() => {
    elManagers.forEach((m) => m.update(flags))
  }, [elManagers, flags])

  useEffect(() => {
    return () => {
      elManagers.forEach((m) => m.dispose())
    }
  }, [elManagers])
}
