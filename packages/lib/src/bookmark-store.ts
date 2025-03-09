import { makeAutoObservable, observable } from "mobx"
import { BookmarkStore } from "./types.js"

class _BookmarkStore {
  private _eventIds: ReadonlySet<string>
  public dateUpdated
  constructor(eventIds: Iterable<string>, dateUpdated?: Date) {
    const set: Set<string> = new Set()
    for (const eventId of eventIds) {
      set.add(eventId)
    }

    this._eventIds = set
    this.dateUpdated = dateUpdated ?? new Date()
    makeAutoObservable<this, "_eventIds">(this, {
      _eventIds: observable.ref,
    })
  }

  get eventIds(): readonly string[] {
    return Array.from(this._eventIds)
  }

  add(eventId: string) {
    const newSet = new Set(this._eventIds)
    newSet.add(eventId)
    this._eventIds = newSet
    this.dateUpdated = new Date()
  }

  delete(eventId: string) {
    const newSet = new Set(this._eventIds)
    newSet.delete(eventId)
    this._eventIds = newSet
    this.dateUpdated = new Date()
  }

  [Symbol.iterator](): Iterator<string> {
    return this._eventIds[Symbol.iterator]()
  }

  keys(): Iterator<string> {
    return this[Symbol.iterator]()
  }

  has(eventId: string): boolean {
    return this._eventIds.has(eventId)
  }

  get size(): number {
    return this._eventIds.size
  }
}

export const makeBookmarkStore = (
  eventIds?: Iterable<string>,
  dateUpdated?: Date
): BookmarkStore => new _BookmarkStore(eventIds ?? [], dateUpdated)

export const makeBookmarkFilter = (
  store: BookmarkStore
): ((e: { readonly id: string }) => boolean) => {
  return (e) => {
    return store.has(e.id)
  }
}
