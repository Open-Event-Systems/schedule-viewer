import {
  type Selections,
  type SelectionsType,
  type ServerSelections,
  type ServerSelectionsAPI,
  type ServerSessionSelectionsAPI,
  type SessionSelectionsAPI,
} from "@open-event-systems/schedule-lib"
import {
  mutationOptions,
  QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query"
import { createContext, use, useCallback } from "react"
import { scheduleQueryOptions, useScheduleConfig } from "./config.js"

export const ServerSelectionsAPIContext = createContext<
  ServerSelectionsAPI | undefined
>(undefined)

export const useServerSelectionsAPI = (): ServerSelectionsAPI | undefined =>
  use(ServerSelectionsAPIContext)

export const ServerSessionSelectionsAPIContext = createContext<{
  readonly [key in SelectionsType]?: ServerSessionSelectionsAPI
}>({})

export const useServerSessionSelectionsAPI = (
  type: SelectionsType,
): ServerSessionSelectionsAPI | undefined =>
  use(ServerSessionSelectionsAPIContext)[type]

export const SessionSelectionsAPIContext = createContext<{
  readonly [key in SelectionsType]?: SessionSelectionsAPI
}>({})

export const useSessionSelectionsAPI = (
  type: SelectionsType,
): SessionSelectionsAPI => {
  const ctx = use(SessionSelectionsAPIContext)[type]
  if (!ctx) {
    throw new Error(`no context for selections type ${type} provided`)
  }

  return ctx
}

/**
 * Query options factories for selections.
 */
export const selectionsQueryOptions = {
  selections: (
    api: ServerSelectionsAPI | undefined,
    scheduleId: string,
    id: string,
  ) =>
    queryOptions({
      queryKey: [
        ...scheduleQueryOptions.schedule(scheduleId),
        "selections",
        id,
      ] as const,
      queryFn: async () => {
        return api ? await api.getSelections(id) : null
      },
      staleTime: Infinity,
    }),
  counts: (
    api: ServerSelectionsAPI | undefined,
    scheduleId: string,
    type: SelectionsType,
  ) =>
    queryOptions({
      queryKey: [
        ...scheduleQueryOptions.schedule(scheduleId),
        "counts",
        { type },
      ],
      queryFn: async () => {
        try {
          return api ? await api.getCounts(type) : new Map()
        } catch (_) {
          return new Map()
        }
      },
      staleTime: 120000,
    }),
} as const

export const sessionSelectionsQueryOptions = {
  sessionSelections: (
    api: SessionSelectionsAPI,
    scheduleId: string,
    type: SelectionsType,
  ) =>
    queryOptions({
      queryKey: [
        ...scheduleQueryOptions.schedule(scheduleId),
        "session-selections",
        { type },
      ],
      queryFn: async () => {
        return await api.get()
      },
      staleTime: 120000,
    }),
}

/**
 * Mutation options for updating session selections.
 */
export const selectionsMutationOptions = {
  setItemSelected: (
    api: SessionSelectionsAPI,
    queryClient: QueryClient,
    scheduleId: string,
    type: SelectionsType,
  ) =>
    mutationOptions({
      mutationKey: [
        ...sessionSelectionsQueryOptions.sessionSelections(
          api,
          scheduleId,
          type,
        ).queryKey,
      ] as const,
      mutationFn: async (args: { itemId: string; selected: boolean }) => {
        const { itemId, selected } = args
        if (selected) {
          return await api.add(itemId)
        } else {
          return await api.delete(itemId)
        }
      },
      onSuccess: (updated) => {
        queryClient.setQueryData(
          sessionSelectionsQueryOptions.sessionSelections(api, scheduleId, type)
            .queryKey,
          updated,
        )
      },
    }),
} as const

/**
 * Hook to get the current session's selections.
 */
export const useSessionSelections = (
  type: SelectionsType,
): UseQueryResult<Selections> => {
  const config = useScheduleConfig()
  const api = useSessionSelectionsAPI(type)
  const query = useQuery(
    sessionSelectionsQueryOptions.sessionSelections(api, config.id, type),
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
  const api = useSessionSelectionsAPI(type)

  const selectFn = useCallback(
    (ssels: Selections) => {
      return ssels.has(id)
    },
    [id],
  )

  const query = useQuery({
    ...sessionSelectionsQueryOptions.sessionSelections(api, config.id, type),
    select: selectFn,
  })

  return query
}

/**
 * Get a function to update the selected status of items.
 */
export const useSetSelected = (
  type: SelectionsType,
): ((itemId: string, selected: boolean) => Promise<Selections>) => {
  const config = useScheduleConfig()
  const queryClient = useQueryClient()
  const api = useSessionSelectionsAPI(type)
  const mutation = useMutation(
    selectionsMutationOptions.setItemSelected(
      api,
      queryClient,
      config.id,
      type,
    ),
  )
  const mutateFunc = useCallback(
    (itemId: string, selected: boolean) => {
      return mutation.mutateAsync({ itemId, selected })
    },
    [mutation.mutateAsync],
  )
  return mutateFunc
}

/**
 * Get selections by ID.
 */
export const useSelections = (
  id: string,
): UseQueryResult<ServerSelections | null> => {
  const config = useScheduleConfig()
  const api = useServerSelectionsAPI()
  return useQuery(selectionsQueryOptions.selections(api, config.id, id))
}

/**
 * Get selection counts.
 */
export const useSelectionCounts = (
  type: SelectionsType,
): UseQueryResult<ReadonlyMap<string, number>> => {
  const config = useScheduleConfig()
  const api = useServerSelectionsAPI()
  return useQuery(selectionsQueryOptions.counts(api, config.id, type))
}

/**
 * Get the selection count for a single item.
 */
export const useSelectionCount = (
  type: SelectionsType,
  itemId: string,
): UseQueryResult<number | undefined> => {
  const config = useScheduleConfig()
  const api = useServerSelectionsAPI()
  const selectFn = useCallback(
    (res: ReadonlyMap<string, number>) => {
      return res.get(itemId)
    },
    [itemId],
  )
  const res = useQuery({
    ...selectionsQueryOptions.counts(api, config.id, type),
    select: selectFn,
  })
  return res
}
