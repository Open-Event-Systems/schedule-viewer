import {
  type SelectionsAPI,
  type Selections,
  type SelectionsType,
  composeSelectionsAPI,
  makeSessionSelectionsStore,
  type SessionSelections,
} from "@open-event-systems/schedule-lib"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createContext, use, useCallback } from "react"
import { useScheduleConfig } from "./config.js"

export const SelectionsAPIContext = createContext<SelectionsAPI>(
  composeSelectionsAPI(makeSessionSelectionsStore("")),
)
export const useSelectionsAPI = (): SelectionsAPI => use(SelectionsAPIContext)

export const selectionsQueryKeys = {
  selections: (scheduleId: string, id: string) =>
    ["schedule", scheduleId, "selections", id] as const,
  sessionSelections: (scheduleId: string, type: SelectionsType) =>
    ["schedule", scheduleId, "session-selections", type] as const,
  bookmarkCounts: (scheduleId: string) =>
    ["schedule", scheduleId, "counts"] as const,
} as const

export const selectionsQueryFns = {
  selections: (selectionsAPI: SelectionsAPI, id: string) => async () => {
    return await selectionsAPI.getSelections(id)
  },
  sessionSelections:
    (selectionsAPI: SelectionsAPI, type: SelectionsType) => async () => {
      return await selectionsAPI.getSessionSelections(type)
    },
  bookmarkCounts:
    (selectionsAPI: SelectionsAPI) =>
    async (): Promise<ReadonlyMap<string, number | undefined>> => {
      return await selectionsAPI.getBookmarkCounts()
    },
} as const

export const selectionsMutationFns = {
  updateSessionSelections:
    (selectionsAPI: SelectionsAPI, type: SelectionsType, id: string) =>
    async (selected: boolean) => {
      if (selected) {
        return await selectionsAPI.updateSessionSelections(type, { add: [id] })
      } else {
        return await selectionsAPI.updateSessionSelections(type, {
          delete: [id],
        })
      }
    },
}

export const useSessionSelections = (
  type: SelectionsType,
): SessionSelections => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()
  const query = useSuspenseQuery({
    queryKey: selectionsQueryKeys.sessionSelections(config.id, type),
    queryFn: selectionsQueryFns.sessionSelections(api, type),
    staleTime: 120000,
  })
  return query.data
}

export const useIsSelected = (type: SelectionsType, id: string): boolean => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()
  const query = useSuspenseQuery({
    queryKey: selectionsQueryKeys.sessionSelections(config.id, type),
    queryFn: selectionsQueryFns.sessionSelections(api, type),
    staleTime: 120000,
    select: useCallback(
      (ssels: SessionSelections) => {
        return ssels.selections.has(id)
      },
      [id],
    ),
  })

  return query.data
}

export const useSetSelected = (
  type: SelectionsType,
  id: string,
): ((selected: boolean) => Promise<SessionSelections>) => {
  const config = useScheduleConfig()
  const queryClient = useQueryClient()
  const api = useSelectionsAPI()
  const mutation = useMutation({
    mutationFn: selectionsMutationFns.updateSessionSelections(api, type, id),
    onSuccess(selections) {
      queryClient.setQueryData(
        selectionsQueryKeys.sessionSelections(config.id, type),
        selections,
      )
    },
  })
  return mutation.mutateAsync
}

export const useSelections = (id: string): Selections | null => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()
  const query = useSuspenseQuery({
    queryKey: selectionsQueryKeys.selections(config.id, id),
    queryFn: selectionsQueryFns.selections(api, id),
    staleTime: Infinity,
  })
  return query.data
}

export const useBookmarkCounts = (): ReadonlyMap<
  string,
  number | undefined
> => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()

  const res = useSuspenseQuery({
    queryKey: selectionsQueryKeys.bookmarkCounts(config.id),
    queryFn: selectionsQueryFns.bookmarkCounts(api),
    staleTime: 120000,
  })
  return res.data
}

export const useBookmarkCount = (itemId: string): number | undefined => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()
  const res = useSuspenseQuery({
    queryKey: selectionsQueryKeys.bookmarkCounts(config.id),
    queryFn: selectionsQueryFns.bookmarkCounts(api),
    staleTime: 120000,
    select: useCallback(
      (res: ReadonlyMap<string, number | undefined>) => {
        return res.get(itemId)
      },
      [itemId],
    ),
  })
  return res.data
}
