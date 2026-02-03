import {
  makeLocalStorageSelectionsAPI,
  type SelectionsAPI,
  type SelectionsServiceAPI,
  type Selections,
  type SelectionsType,
} from "@open-event-systems/schedule-lib"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createContext, useContext } from "react"
import { useScheduleConfig } from "./config.js"

export const SelectionsAPIContext = createContext<
  SelectionsAPI | SelectionsServiceAPI
>(makeLocalStorageSelectionsAPI(""))
export const useSelectionsAPI = (): SelectionsAPI | SelectionsServiceAPI =>
  useContext(SelectionsAPIContext)

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
    (selectionsAPI: SelectionsAPI | SelectionsServiceAPI) =>
    async (): Promise<ReadonlyMap<string, number | undefined>> => {
      if ("getBookmarkCounts" in selectionsAPI) {
        const res = selectionsAPI.getBookmarkCounts()
        return new Map(Object.entries(res))
      } else {
        return new Map()
      }
    },
} as const

export const selectionsMutationFns = {
  setSessionSelections:
    (selectionsAPI: SelectionsAPI, type: SelectionsType) =>
    async (selections: Selections) => {
      return await selectionsAPI.setSessionSelections(type, selections)
    },
}

export const useSessionSelections = (type: SelectionsType): Selections => {
  const config = useScheduleConfig()
  const api = useSelectionsAPI()
  const query = useSuspenseQuery({
    queryKey: selectionsQueryKeys.sessionSelections(config.id, type),
    queryFn: selectionsQueryFns.sessionSelections(api, type),
    staleTime: 120000,
  })
  return query.data
}

export const useSetSelections = (
  type: SelectionsType,
): ((selections: Selections) => Promise<Selections>) => {
  const config = useScheduleConfig()
  const queryClient = useQueryClient()
  const api = useSelectionsAPI()
  const mutation = useMutation({
    mutationKey: selectionsQueryKeys.sessionSelections(config.id, type),
    mutationFn: selectionsMutationFns.setSessionSelections(api, type),
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

export const useBookmarkCount = (eventId: string): number | undefined => {
  const counts = useBookmarkCounts()
  return counts.get(eventId)
}
