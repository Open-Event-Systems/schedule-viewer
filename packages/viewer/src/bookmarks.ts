import {
  BookmarkStore,
  makeBookmarkStore,
} from "@open-event-systems/schedule-lib"
import { makeAutoObservable, reaction, toJS } from "mobx"
import { createContext, useContext } from "react"

const LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-bookmarks-v1-"

export class LocalStorageBookmarkStore {
  constructor(public store: BookmarkStore, public scheduleId: string) {
    makeAutoObservable(this)

    reaction(
      () => [],
      () => {}
    )
  }

  get eventIds(): readonly string[] {
    return this.store.eventIds
  }

  get dateUpdated(): Date {
    return this.store.dateUpdated
  }

  add(eventId: string) {
    this.store.add(eventId)
    this.save()
  }

  delete(eventId: string) {
    this.store.delete(eventId)
    this.save()
  }

  keys(): Iterator<string> {
    return this.store.keys()
  }

  [Symbol.iterator](): Iterator<string> {
    return this.store[Symbol.iterator]()
  }

  has(eventId: string): boolean {
    return this.store.has(eventId)
  }

  get size(): number {
    return this.store.size
  }

  private save() {
    const body = toJS({
      eventIds: this.eventIds,
      dateUpdated: this.dateUpdated.toISOString(),
    })
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${this.scheduleId}`
    const jsonStr = JSON.stringify(body)
    window.localStorage.setItem(key, jsonStr)
  }

  public static load(
    factory: (eventIds?: Iterable<string>, dateUpdated?: Date) => BookmarkStore,
    scheduleId: string
  ): LocalStorageBookmarkStore {
    const data = tryLoad(scheduleId)
    if (data) {
      const store = factory(data.eventIds, data.dateUpdated)
      return new LocalStorageBookmarkStore(store, scheduleId)
    }
    return new LocalStorageBookmarkStore(factory(), scheduleId)
  }
}

const tryLoad = (scheduleId: string) => {
  const key = `${LOCAL_STORAGE_KEY_PREFIX}${scheduleId}`
  const jsonStr = window.localStorage.getItem(key)
  if (!jsonStr) {
    return null
  }

  try {
    const body: { dateUpdated?: string; eventIds?: string[] } =
      JSON.parse(jsonStr)
    if (!body.dateUpdated || !body.eventIds || !Array.isArray(body.eventIds)) {
      return null
    }

    return {
      dateUpdated: new Date(body.dateUpdated),
      eventIds: body.eventIds,
    }
  } catch (_) {
    return null
  }
}

export const makeLocalStorageBookmarkStore = (
  store: BookmarkStore,
  scheduleId: string
): BookmarkStore => {
  return new LocalStorageBookmarkStore(store, scheduleId)
}

export const BookmarkStoreContext = createContext(makeBookmarkStore())
export const BookmarkStoreProvider = BookmarkStoreContext.Provider
export const useBookmarkStore = (): BookmarkStore =>
  useContext(BookmarkStoreContext)
