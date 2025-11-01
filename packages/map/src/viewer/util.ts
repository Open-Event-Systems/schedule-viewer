import { useEffect, useState, useSyncExternalStore } from "react"

type TransitionState = "off" | "forward" | "backward" | "on"

class TransitionStateManager {
  private isometric: boolean
  private state: TransitionState
  private timeout: number | undefined = undefined
  private observers: (() => void)[] = []

  constructor(initial: boolean) {
    this.isometric = initial
    this.state = initial ? "on" : "off"
  }

  setIsometric = (value: boolean) => {
    if (value && !this.isometric) {
      // transition forward
      if (this.timeout != null) {
        window.clearTimeout(this.timeout)
      }

      // 30fps frame delay
      this.timeout = window.setTimeout(() => {
        if (this.isometric) {
          this.state = "forward"
          this.notify()
        }
      }, 34)
    } else if (!value && this.isometric) {
      // transition backwards
      if (this.timeout != null) {
        window.clearTimeout(this.timeout)
      }

      this.state = "backward"
      this.notify()
    }

    this.isometric = value
  }

  onTransitionEnd = () => {
    if (this.isometric) {
      this.state = "on"
      this.notify()
    } else {
      this.state = "off"
      this.notify()
    }
  }

  subscribe = (cb: () => void): (() => void) => {
    this.observers.push(cb)
    return () => {
      const idx = this.observers.indexOf(cb)
      if (idx != -1) {
        this.observers.splice(idx, 1)
      }
    }
  }

  getSnapshot = (): TransitionState => this.state

  private notify() {
    this.observers.forEach((cb) => cb())
  }
}

export const useIsometricTransition = (
  isometric: boolean,
): [boolean, boolean, boolean, () => void] => {
  const [mgr] = useState(() => new TransitionStateManager(isometric))
  const transitionState = useSyncExternalStore(mgr.subscribe, mgr.getSnapshot)

  useEffect(() => {
    mgr.setIsometric(isometric)
  }, [mgr, isometric])

  // isometric class is added first, removed last
  const hasIsoCls = isometric || transitionState != "off"
  const hasTransformCls =
    isometric && (transitionState == "forward" || transitionState == "on")
  const hasFinishedCls = isometric && transitionState == "on"

  return [hasIsoCls, hasTransformCls, hasFinishedCls, mgr.onTransitionEnd]
}
