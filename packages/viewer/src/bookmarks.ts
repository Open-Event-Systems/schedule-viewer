import {
  BookmarkAPI,
  BookmarkStore,
  makeBookmarkStore,
  SessionBookmarksResponse,
} from "@open-event-systems/schedule-lib"
import {
  MutationOptions,
  QueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"
import { isAfter } from "date-fns"
import { makeAutoObservable, toJS } from "mobx"
import { createContext, useContext } from "react"

const LOCAL_STORAGE_KEY_PREFIX = "oes-schedule-bookmarks-v1-"

export const getSessionBookmarksQueryOptions = (
  bookmarkAPI: BookmarkAPI,
  scheduleId: string
): UseQueryOptions<SessionBookmarksResponse> => {
  return {
    queryKey: ["schedule", scheduleId, "bookmarks"],
    async queryFn() {
      return bookmarkAPI.getSessionBookmarks()
    },
    staleTime: Infinity,
  }
}

export const getSessionBookmarksMutationOptions = (
  queryClient: QueryClient,
  bookmarkAPI: BookmarkAPI,
  scheduleId: string
): MutationOptions<SessionBookmarksResponse, Error, Iterable<string>> => {
  return {
    mutationKey: ["schedule", scheduleId, "bookmarks"],
    async mutationFn(eventIds) {
      return await bookmarkAPI.setBookmarks(eventIds)
    },
    onSuccess(data) {
      queryClient.setQueryData(["schedule", scheduleId, "bookmarks"], data)
    },
  }
}

type StoreFactory = (
  eventIds?: Iterable<string>,
  dateUpdated?: Date
) => BookmarkStore

export const withUseNewerData = (
  factory: StoreFactory,
  curEventIds?: Iterable<string>,
  curDateUpdated?: Date
): StoreFactory => {
  const wrapped = (
    eventIds?: Iterable<string>,
    dateUpdated?: Date
  ): BookmarkStore => {
    if (
      curEventIds &&
      isAfter(curDateUpdated || new Date(0), dateUpdated || new Date(0))
    ) {
      return factory(curEventIds, curDateUpdated)
    } else {
      return factory(eventIds, dateUpdated)
    }
  }

  return wrapped
}

export class BookmarkAPIBookmarkStore {
  constructor(
    public store: BookmarkStore,
    private updater: (eventIds: Iterable<string>) => void
  ) {}

  get eventIds(): readonly string[] {
    return this.store.eventIds
  }

  get dateUpdated(): Date {
    return this.store.dateUpdated
  }

  add(eventId: string) {
    this.store.add(eventId)
    this.updater(this.eventIds)
  }

  delete(eventId: string) {
    this.store.delete(eventId)
    this.updater(this.eventIds)
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
}

export const makeBookmarkAPIBookmarkStoreFactory = (
  factory: StoreFactory,
  updater: (eventIds: Iterable<string>) => void
): StoreFactory => {
  const wrapped: StoreFactory = (eventIds, dateUpdated) => {
    const inner = factory(eventIds, dateUpdated)
    return new BookmarkAPIBookmarkStore(inner, updater)
  }
  return wrapped
}

export class LocalStorageBookmarkStore {
  constructor(public store: BookmarkStore, public scheduleId: string) {
    makeAutoObservable(this)
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

export const BookmarkAPIContext = createContext<BookmarkAPI | undefined>(
  undefined
)
export const BookmarkAPIProvider = BookmarkAPIContext.Provider
export const useBookmarkAPI = (): BookmarkAPI | undefined =>
  useContext(BookmarkAPIContext)

export const BookmarkStoreContext = createContext(makeBookmarkStore())
export const BookmarkStoreProvider = BookmarkStoreContext.Provider
export const useBookmarkStore = (): BookmarkStore =>
  useContext(BookmarkStoreContext)
