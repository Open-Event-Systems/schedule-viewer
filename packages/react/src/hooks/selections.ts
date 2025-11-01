import {
  makeLocalStorageBookmarkAPI,
  type BookmarkAPI,
  type BookmarkServiceAPI,
  type Selections,
} from "@open-event-systems/schedule-lib"
import type { ScheduleConfig } from "../types.js"
import {
  QueryClient,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query"
import { createContext, useContext } from "react"
import { useScheduleConfig } from "./config.js"

export const BookmarkAPIContext = createContext<
  readonly [BookmarkAPI, BookmarkServiceAPI | null]
>([makeLocalStorageBookmarkAPI(""), null])
export const BookmarkAPIProvider = BookmarkAPIContext.Provider
export const useBookmarkAPI = (): BookmarkAPI =>
  useContext(BookmarkAPIContext)[0]
export const useBookmarkServiceAPI = (): BookmarkServiceAPI | null =>
  useContext(BookmarkAPIContext)[1]

export const getSelectionsQueryOptions = (
  config: ScheduleConfig,
  bookmarkAPI: BookmarkAPI,
): UseSuspenseQueryOptions<Selections> => ({
  queryKey: ["schedule", config.id, "bookmarks"],
  async queryFn() {
    return await bookmarkAPI.getSessionSelections()
  },
  staleTime: 120000,
})

export const useSelections = (): Selections => {
  const config = useScheduleConfig()
  const bookmarkAPI = useBookmarkAPI()
  const res = useSuspenseQuery(getSelectionsQueryOptions(config, bookmarkAPI))
  return res.data
}

export const getSetSelectionsMutationOptions = (
  queryClient: QueryClient,
  config: ScheduleConfig,
  api: BookmarkAPI,
): UseMutationOptions<Selections, Error, Selections> => ({
  mutationKey: ["schedule", config.id, "bookmarks"],
  async mutationFn(selections) {
    return await api.setSessionSelections(selections)
  },
  onSuccess(data) {
    queryClient.setQueryData(
      getSelectionsQueryOptions(config, api).queryKey,
      data,
    )
  },
})

export const useSetSelections = (): ((
  selections: Selections,
) => Promise<Selections>) => {
  const config = useScheduleConfig()
  const queryClient = useQueryClient()
  const api = useBookmarkAPI()
  const mutation = useMutation(
    getSetSelectionsMutationOptions(queryClient, config, api),
  )

  return mutation.mutateAsync
}

export const getSelectionsByIdQueryOptions = (
  config: ScheduleConfig,
  api: BookmarkAPI,
  id: string,
): UseSuspenseQueryOptions<Selections | null> => ({
  queryKey: ["schedule", config.id, "bookmarks", id],
  async queryFn() {
    return await api.getSelections(id)
  },
  staleTime: Infinity,
})

export const useSelectionsById = (id: string): Selections | null => {
  const config = useScheduleConfig()
  const api = useBookmarkAPI()
  const query = useSuspenseQuery(getSelectionsByIdQueryOptions(config, api, id))
  return query.data
}

export const getBookmarkCountsQueryOptions = (
  config: ScheduleConfig,
  api: BookmarkServiceAPI | null,
): UseSuspenseQueryOptions<ReadonlyMap<string, number | undefined> | null> => ({
  queryKey: ["schedule", config.id, "counts"],
  async queryFn() {
    if (api) {
      const res = await api.getBookmarkCounts()
      const map = new Map<string, number | undefined>()

      for (const key of Object.keys(res)) {
        map.set(key, res[key])
      }

      return map
    } else {
      return null
    }
  },
  staleTime: 120000,
})

export const useBookmarkCounts = ():
  | ReadonlyMap<string, number | undefined>
  | undefined => {
  const config = useScheduleConfig()
  const api = useBookmarkServiceAPI()

  const res = useSuspenseQuery(getBookmarkCountsQueryOptions(config, api))
  return res.data ?? undefined
}

export const useBookmarkCount = (eventId: string): number | undefined => {
  const counts = useBookmarkCounts()
  return counts?.get(eventId)
}
