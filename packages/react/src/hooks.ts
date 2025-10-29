import {
  type BookmarkAPI,
  type BookmarkServiceAPI,
  makeBookmarkFilter,
  makePastItemFilter,
  makeScheduleEventStore,
  makeScheduleItemsArrayAPI,
  makeTagFilter,
  makeTitleFilter,
  makeVendorStore,
  type ScheduleAPI,
  type ScheduleEvent,
  type ScheduleItem,
  ScheduleItemStore,
  type Selections,
  type Vendor,
} from "@open-event-systems/schedule-lib"
import { type ScheduleConfig, useScheduleConfig } from "./config/config.js"
import { createContext, useContext, useMemo, useReducer } from "react"
import {
  QueryClient,
  useMutation,
  type UseMutationOptions,
  useQueryClient,
  type UseQueryOptions,
  useSuspenseQuery,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query"
import { useBookmarkAPI, useBookmarkServiceAPI } from "./bookmarks.js"

export const ScheduleAPIContext = createContext<ScheduleAPI>(
  makeScheduleItemsArrayAPI([]),
)
export const ScheduleAPIProvider = ScheduleAPIContext.Provider
export const useScheduleAPI = (): ScheduleAPI => useContext(ScheduleAPIContext)

export const getItemsQueryOptions = (
  config: ScheduleConfig,
  api: ScheduleAPI,
): UseSuspenseQueryOptions<
  Readonly<{
    items: ScheduleItemStore
    events: ScheduleItemStore<ScheduleEvent>
    vendors: ScheduleItemStore<Vendor>
  }>
> => ({
  queryKey: ["schedule", config.id, "items"],
  async queryFn() {
    const res = await api.getItems()
    const items = new ScheduleItemStore(res)
    const events = makeScheduleEventStore(items)
    const vendors = makeVendorStore(items)
    return { items, events, vendors }
  },
  staleTime: 300000,
})

export const useItems = (): Readonly<{
  items: ScheduleItemStore
  events: ScheduleItemStore<ScheduleEvent>
  vendors: ScheduleItemStore<Vendor>
}> => {
  const config = useScheduleConfig()
  const api = useScheduleAPI()
  const res = useSuspenseQuery(getItemsQueryOptions(config, api))
  return res.data
}

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

export type FilterSettings = Readonly<{
  text: string
  disabledTags: ReadonlySet<string>
  onlyBookmarked: boolean
  showPast: boolean
}>

export const FilterContext = createContext<
  [FilterSettings, (update: Partial<FilterSettings>) => void]
>([
  {
    text: "",
    disabledTags: new Set(),
    onlyBookmarked: false,
    showPast: false,
  },
  () => {},
])
export const FilterProvider = FilterContext.Provider
export const useFilter = (): [
  FilterSettings,
  (update: Partial<FilterSettings>) => void,
] => useContext(FilterContext)

export const useFilterState = (): [
  FilterSettings,
  (update: Partial<FilterSettings>) => void,
] => {
  const reducer = (
    state: FilterSettings,
    action: Partial<FilterSettings>,
  ): FilterSettings => {
    const newState = {
      ...state,
      ...action,
    }
    return newState
  }

  return useReducer(reducer, {
    text: "",
    disabledTags: new Set(),
    onlyBookmarked: false,
    showPast: false,
  })
}

export const useFilteredItems = <
  T extends ScheduleItem & {
    readonly title?: string
    readonly tags?: ReadonlySet<string>
  },
>(
  items: ScheduleItemStore<T>,
  now: Date,
  selections?: Selections,
): ScheduleItemStore<T> => {
  const [filter] = useFilter()
  const byBookmarked = useMemo(() => {
    if (filter.onlyBookmarked) {
      return selections
        ? items.filter(makeBookmarkFilter(selections.events))
        : new ScheduleItemStore([])
    } else {
      return items
    }
  }, [filter.onlyBookmarked, items, selections])
  const byTag = useMemo(
    () => byBookmarked.filter(makeTagFilter(filter.disabledTags)),
    [byBookmarked, filter.disabledTags],
  )
  const byPast = useMemo(
    () => (!filter.showPast ? byTag.filter(makePastItemFilter(now)) : byTag),
    [filter.showPast, byTag, now],
  )
  const byTitle = useMemo(
    () => (filter.text ? byPast.filter(makeTitleFilter(filter.text)) : byPast),
    [filter.text, byPast],
  )

  return byTitle
}
