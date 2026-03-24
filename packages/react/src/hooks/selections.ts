import {
  type SelectionsAPI,
  type Selections,
  type SelectionsType,
  composeSelectionsAPI,
  makeSessionSelectionsStore,
  type SessionSelections,
} from "@open-event-systems/schedule-lib"
import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
  type UseQueryResult,
} from "@tanstack/react-query"
import { createContext, use, useCallback } from "react"
import { scheduleQueryOptions, useScheduleConfig } from "./config.js"

export const SelectionsAPIContext = createContext<SelectionsAPI>(
  composeSelectionsAPI(makeSessionSelectionsStore("")),
)
export const useSelectionsAPI = (): SelectionsAPI => use(SelectionsAPIContext)

/**
 * Query options factories for schedule items.
 */
export const selectionsQueryOptions = {
  selections: (api: SelectionsAPI, scheduleId: string, id: string) =>
    queryOptions({
      queryKey: [
        ...scheduleQueryOptions.schedule(scheduleId),
        "selections",
        id,
      ] as const,
      queryFn: async () => {
        return await api.getSelections(id)
      },
      staleTime: Infinity,
    }),
  sessionSelections: (
    api: SelectionsAPI,
    scheduleId: string,
    type: SelectionsType,
  ) =>
    queryOptions({
      queryKey: [
        ...scheduleQueryOptions.schedule(scheduleId),
        "session-selections",
        { type },
      ] as const,
      queryFn: async () => {
        return await api.getSessionSelections(type)
      },
      staleTime: 120000,
    }),
  bookmarkCounts: (api: SelectionsAPI, scheduleId: string) =>
    queryOptions({
      queryKey: [
        ...scheduleQueryOptions.schedule(scheduleId),
        "counts",
      ] as const,
      queryFn: async () => {
        return await api.getBookmarkCounts()
      },
      staleTime: 120000,
    }),
} as const

/**
 * Mutation options for updating session selections.
 */
export const selectionsMutationOptions = {
  updateSessionSelections: (
    api: SelectionsAPI,
    scheduleId: string,
    type: SelectionsType,
    id: string,
  ) =>
    mutationOptions({
      mutationKey: [
        ...selectionsQueryOptions.sessionSelections(api, scheduleId, type)
          .queryKey,
        id,
      ] as const,
      mutationFn: async (selected: boolean) => {
        if (selected) {
          return await api.updateSessionSelections(type, { add: [id] })
        } else {
          return await api.updateSessionSelections(type, {
            delete: [id],
          })
        }
      },
    }),
} as const

/**
 * Hook to get the current session's selections.
 */
export const useSessionSelections = (
  type: SelectionsType,
): UseQueryResult<SessionSelections> => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()
  const query = useQuery(
    selectionsQueryOptions.sessionSelections(api, config.id, type),
  )
  return query
}

/**
 * Hook to get whether an item is selected.
 */
export const useIsSelected = (
  type: SelectionsType,
  id: string,
): UseQueryResult<boolean> => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()

  const selectFn = useCallback(
    (ssels: SessionSelections) => {
      return ssels.selections.has(id)
    },
    [id],
  )

  const query = useQuery({
    ...selectionsQueryOptions.sessionSelections(api, config.id, type),
    select: selectFn,
  })

  return query
}

/**
 * Get a function to update the selected status of an item.
 */
export const useSetSelected = (
  type: SelectionsType,
  id: string,
): ((selected: boolean) => Promise<SessionSelections>) => {
  const config = useScheduleConfig()
  const queryClient = useQueryClient()
  const api = useSelectionsAPI()
  const mutation = useMutation({
    ...selectionsMutationOptions.updateSessionSelections(
      api,
      config.id,
      type,
      id,
    ),
    onSuccess(selections) {
      queryClient.setQueryData(
        selectionsQueryOptions.sessionSelections(api, config.id, type).queryKey,
        selections,
      )
    },
  })
  return mutation.mutateAsync
}

/**
 * Get selections by ID.
 */
export const useSelections = (id: string): Selections | null => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()
  const query = useSuspenseQuery(
    selectionsQueryOptions.selections(api, config.id, id),
  )
  return query.data
}

/**
 * Get bookmark counts.
 */
export const useBookmarkCounts = (): UseQueryResult<
  ReadonlyMap<string, number>
> => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()

  const res = useQuery(selectionsQueryOptions.bookmarkCounts(api, config.id))
  return res
}

/**
 * Get the bookmark count for a single item.
 */
export const useBookmarkCount = (
  itemId: string,
): UseQueryResult<number | undefined> => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()
  const selectFn = useCallback(
    (res: ReadonlyMap<string, number | undefined>) => {
      return res.get(itemId)
    },
    [itemId],
  )
  const res = useQuery({
    ...selectionsQueryOptions.bookmarkCounts(api, config.id),
    select: selectFn,
  })
  return res
}
