import { isAfter } from "date-fns"
import type { ScheduleItem } from "./types.js"

/**
 * Collection of {@link ScheduleItem} with utility methods.
 *
 * Items must be sorted by start date.
 */
export class ScheduleItemStore<out T extends ScheduleItem = ScheduleItem> {
  private _items: T[]
  private byId: Map<string, T> | undefined = undefined
  private _start: Date | undefined = undefined
  private setStart = false
  private _end: Date | undefined = undefined
  private setEnd = false

  constructor(items: Iterable<T>) {
    this._items = [...items]
  }

  get(id: string): T | undefined {
    if (!this.byId) {
      this.byId = new Map()
      this._items.forEach((item) => this.byId?.set(item.id, item))
    }
    return this.byId.get(id)
  }

  [Symbol.iterator](): Iterator<T> {
    return this._items[Symbol.iterator]()
  }

  get items(): readonly T[] {
    return this._items
  }

  get size(): number {
    return this._items.length
  }

  map<N extends ScheduleItem>(
    f: (item: T, i: number) => N | undefined,
  ): ScheduleItemStore<N> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    function* gen(): Generator<N> {
      let i = 0
      for (const item of that) {
        const res = f(item, i)
        if (res) {
          yield res
        }
        i++
      }
    }

    return new ScheduleItemStore(gen())
  }

  filter<N extends T>(
    f: (item: T, i: number) => item is N,
  ): ScheduleItemStore<N>
  filter(f: (item: T, i: number) => boolean): ScheduleItemStore<T>
  filter(f: (item: T, i: number) => boolean): ScheduleItemStore<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    function* gen(): Generator<T> {
      let i = 0
      for (const item of that) {
        if (f(item, i)) {
          yield item
        }
        i++
      }
    }

    return new ScheduleItemStore(gen())
  }

  get first(): T | undefined {
    return this._items[0]
  }

  get last(): T | undefined {
    return this._items[this._items.length - 1]
  }

  get start(): Date | undefined {
    if (!this.setStart) {
      for (const item of this._items) {
        if (item.start) {
          this._start = item.start
          break
        }
      }
      this.setStart = true
    }
    return this._start
  }

  get end(): Date | undefined {
    if (!this.setEnd) {
      for (const item of this._items) {
        if (item.end && (!this._end || isAfter(item.end, this._end))) {
          this._end = item.end
        }
      }
      this.setEnd = true
    }
    return this._end
  }
}
