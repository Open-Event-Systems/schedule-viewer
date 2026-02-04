import { observable } from "mobx"

/**
 * Basic Set-like object, just to implement an observable set.
 */
export interface ReadonlyBasicSet<T> {
  keys(): Iterator<T>
  [Symbol.iterator](): Iterator<T>
  has(value: T): boolean
  readonly size: number
}

/**
 * Mutable basic Set-like object, just to implement an observable set.
 */
export interface BasicSet<T> extends ReadonlyBasicSet<T> {
  add(value: T): this
  clear(): void
  delete(value: T): boolean
}

/**
 * Returns a {@link BasicSet} that is a MobX observable.
 *
 * Normal sets' memberships are not observable: https://github.com/mobxjs/mobx/issues/2336#issuecomment-616128089
 */
export const makeObservableSet = <T>(items?: Iterable<T>): BasicSet<T> => {
  const itemsMap = observable.map<T, true>(
    Array.from(items ?? [], (item) => [item, true]),
  )

  return {
    add(value) {
      itemsMap.set(value, true)
      return this
    },
    clear() {
      itemsMap.clear()
    },
    delete(value) {
      return itemsMap.delete(value)
    },
    keys() {
      return itemsMap.keys()
    },
    [Symbol.iterator]() {
      return itemsMap.keys()
    },
    has(value) {
      return itemsMap.has(value)
    },
    get size() {
      return itemsMap.size
    },
  }
}
