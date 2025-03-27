import {
  BookmarkAPI,
  chooseNewer,
  makeSelections,
  Selections,
} from "@open-event-systems/schedule-lib"
import {
  QueryClient,
  useMutation,
  UseMutationOptions,
  useQueryClient,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query"
import { parseISO } from "date-fns"
import { loadSelections, saveSelections } from "./local-storage.js"
import { createContext, useCallback, useContext } from "react"

declare module "@open-event-systems/schedule-lib" {
  interface ScheduleConfig {
    bookmarks?: string
  }
}

export const BookmarkAPIContext = createContext<BookmarkAPI | undefined>(
  undefined,
)
export const BookmarkAPIProvider = BookmarkAPIContext.Provider
export const useBookmarkAPI = (): BookmarkAPI | undefined =>
  useContext(BookmarkAPIContext)

export const getBookmarksByIdQueryOptions = (
  bookmarkAPI: BookmarkAPI | null | undefined,
  scheduleId: string,
  selectionId: string,
): UseSuspenseQueryOptions<Selections | null> => {
  return {
    queryKey: ["schedule", scheduleId, "bookmarks", selectionId],
    async queryFn() {
      if (bookmarkAPI) {
        const resp = await bookmarkAPI.getBookmarks(selectionId)
        return resp ? makeSelections(resp.events) : null
      } else {
        return null
      }
    },
  }
}

export const getSessionBookmarksQueryOptions = (
  bookmarkAPI: BookmarkAPI | null | undefined,
  scheduleId: string,
): UseSuspenseQueryOptions<Selections> => {
  return {
    queryKey: ["schedule", scheduleId, "bookmarks"],
    async queryFn() {
      if (bookmarkAPI) {
        const res = await bookmarkAPI.getSessionBookmarks()
        return makeSelections(res.events, parseISO(res.date))
      } else {
        return makeSelections()
      }
    },
    staleTime: Infinity,
  }
}

export const getStoredBookmarksQueryOptions = (
  scheduleId: string,
): UseSuspenseQueryOptions<Selections> => {
  return {
    queryKey: ["schedule", scheduleId, "stored-bookmarks"],
    async queryFn() {
      return loadSelections(scheduleId)
    },
    staleTime: Infinity,
  }
}

export const getStoredBookmarksMutationOptions = (
  queryClient: QueryClient,
  scheduleId: string,
): UseMutationOptions<Selections, Error, Selections> => {
  return {
    mutationKey: ["schedule", scheduleId, "stored-bookmarks"],
    async mutationFn(selections) {
      saveSelections(scheduleId, selections)
      return selections
    },
    onSuccess(selections) {
      queryClient.setQueryData(
        ["schedule", scheduleId, "stored-bookmarks"],
        selections,
      )
    },
  }
}

export const getSessionBookmarksMutationOptions = (
  queryClient: QueryClient,
  bookmarkAPI: BookmarkAPI | null | undefined,
  scheduleId: string,
): UseMutationOptions<[string, Selections], Error, Selections> => {
  return {
    mutationKey: ["schedule", scheduleId, "bookmarks"],
    async mutationFn(selections) {
      if (bookmarkAPI) {
        const res = await bookmarkAPI.setBookmarks(selections)
        return [res.id, makeSelections(res.events, parseISO(res.date))]
      }
      return ["", selections]
    },
    onSuccess(selections) {
      queryClient.setQueryData(
        ["schedule", scheduleId, "bookmarks"],
        selections,
      )
    },
  }
}

export const getBookmarkCountsQueryOptions = (
  bookmarkAPI: BookmarkAPI | null | undefined,
  scheduleId: string,
): UseSuspenseQueryOptions<ReadonlyMap<string, number>> => {
  return {
    queryKey: ["schedule", scheduleId, "counts"],
    async queryFn() {
      if (bookmarkAPI) {
        const resp = await bookmarkAPI.getBookmarkCounts()
        const map = new Map<string, number>()
        for (const [eventId, count] of Object.entries(resp.counts)) {
          map.set(eventId, count)
        }
        return map
      }
      return new Map<string, number>()
    },
    staleTime: Infinity,
  }
}

export const useBookmarks = (scheduleId: string): Selections => {
  const bookmarkAPI = useBookmarkAPI()
  const local = useSuspenseQuery(getStoredBookmarksQueryOptions(scheduleId))
  const session = useSuspenseQuery(
    getSessionBookmarksQueryOptions(bookmarkAPI, scheduleId),
  )
  return chooseNewer(local.data, session.data)
}

export const useBookmarksById = (
  scheduleId: string,
  selectionId: string,
): Selections | null => {
  const bookmarkAPI = useBookmarkAPI()
  const query = useSuspenseQuery(
    getBookmarksByIdQueryOptions(bookmarkAPI, scheduleId, selectionId),
  )
  return query.data
}

export const useUpdateBookmarks = (
  scheduleId: string,
): ((selections: Selections) => Promise<[string, Selections]>) => {
  const queryClient = useQueryClient()
  const bookmarkAPI = useBookmarkAPI()
  const localMutation = useMutation(
    getStoredBookmarksMutationOptions(queryClient, scheduleId),
  )
  const sessionMutation = useMutation(
    getSessionBookmarksMutationOptions(queryClient, bookmarkAPI, scheduleId),
  )

  const updater = useCallback(
    async (selections: Selections): Promise<[string, Selections]> => {
      // update both local+remote simultaneously
      const [_localRes, [remoteId, remoteRes]] = await Promise.all([
        localMutation.mutateAsync(selections),
        sessionMutation.mutateAsync(selections),
      ])

      // return the remote version
      return [remoteId, remoteRes]
    },
    [
      queryClient,
      bookmarkAPI,
      localMutation.mutateAsync,
      sessionMutation.mutateAsync,
      scheduleId,
    ],
  )

  return updater
}

export const useBookmarkCounts = (
  scheduleId: string,
): ReadonlyMap<string, number> => {
  const bookmarkAPI = useBookmarkAPI()
  const query = useSuspenseQuery(
    getBookmarkCountsQueryOptions(bookmarkAPI, scheduleId),
  )
  return query.data
}

export const useBookmarkCount = (
  scheduleId: string,
  eventId: string,
): number | undefined => {
  const counts = useBookmarkCounts(scheduleId)
  return counts.get(eventId)
}
