import type { ScheduleItem, ScheduleItemCollection } from "./types.js"

class _ScheduleItemCollection<T extends ScheduleItem>
  implements ScheduleItemCollection<T>
{
  private _items: readonly T[]
  private byId: Map<string, T> | null = null

  constructor(items?: Iterable<T>) {
    this._items = [...(items ?? [])]
  }

  get size(): number {
    return this._items.length
  }

  get items(): readonly T[] {
    return this._items
  }

  [Symbol.iterator]() {
    return this._items[Symbol.iterator]()
  }

  get(id: string): T | undefined {
    if (!this.byId) {
      this.byId = new Map(this._items.map((item) => [item.id, item]))
    }
    return this.byId.get(id)
  }

  *filter(f: (item: T, index: number) => boolean): Iterable<T> {
    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i]
      if (item && f(item, i)) {
        yield item
      }
    }
  }

  *map<N>(f: (item: T, index: number) => N): Iterable<N> {
    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i]
      if (item) {
        yield f(item, i)
      }
    }
  }
}

/**
 * Make a {@link ScheduleItemCollection} from an iterable.
 */
export const makeScheduleItemCollection = <
  T extends ScheduleItem = ScheduleItem,
>(
  items?: Iterable<T>,
): ScheduleItemCollection<T> => {
  if (items instanceof _ScheduleItemCollection) {
    return items
  }

  return new _ScheduleItemCollection(items)
}
