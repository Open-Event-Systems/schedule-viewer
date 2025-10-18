import { isAfter } from "date-fns"
import { ScheduleItem } from "./types.js"

/**
 * Collection of {@link ScheduleItem} with utility methods.
 *
 * Items must be sorted by start date.
 */
export class ScheduleItemStore<out T extends ScheduleItem = ScheduleItem> {
  private _items: T[]
  private byId: Map<string, T> | undefined = undefined
  private _tags: Set<string> | undefined = undefined
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

  get tags(): ReadonlySet<string> {
    if (!this._tags) {
      this._tags = new Set()
      this._items.forEach((item) => {
        item.tags?.forEach((tag) => this._tags?.add(tag))
      })
    }
    return this._tags
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
