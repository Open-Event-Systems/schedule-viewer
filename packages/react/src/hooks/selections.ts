import {
  type Selections,
  type SelectionsService,
  type SelectionsType,
  type ServerSelections,
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
import { createContext, use, useCallback, useEffect, useState } from "react"
import { scheduleQueryOptions, useScheduleConfig } from "./config.js"

export const SelectionsServiceContext = createContext<
  SelectionsService | undefined
>(undefined)

export const useSelectionsService = (): SelectionsService => {
  const res = use(SelectionsServiceContext)
  if (!res) {
    throw new Error("SelectionsService not provided")
  }
  return res
}

/**
 * Query options factories for selections.
 */
export const selectionsQueryOptions = {
  selections: (
    api: SelectionsService | null | undefined,
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
        return api ? await api.getById(id) : null
      },
      staleTime: Infinity,
    }),
  counts: (
    api: SelectionsService | null | undefined,
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
    api: SelectionsService,
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
        return await api.load(type)
      },
      staleTime: 120000,
    }),
}

/**
 * Mutation options for updating session selections.
 */
export const selectionsMutationOptions = {
  setItemSelected: (
    api: SelectionsService,
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
      mutationFn: async ({
        itemId,
        selected,
      }: {
        itemId: string
        selected: boolean
      }) => {
        const cur = await api.load(type)
        let updated
        if (selected) {
          updated = cur.add(itemId)
        } else {
          updated = cur.delete(itemId)
        }

        return api.save(type, updated)
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
  const api = useSelectionsService()
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
  const api = useSelectionsService()

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
  const api = useSelectionsService()
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
  const api = useSelectionsService()
  return useQuery(selectionsQueryOptions.selections(api, config.id, id))
}

/**
 * Get selection counts.
 */
export const useSelectionCounts = (
  type: SelectionsType,
): UseQueryResult<ReadonlyMap<string, number>> => {
  const config = useScheduleConfig()
  const api = useSelectionsService()
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
  const api = useSelectionsService()
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

/**
 * Hook that returns true when the selections service is configured and the
 * network is available.
 */
export const useSelectionsServiceAvailable = (): boolean => {
  const api = useSelectionsService()
  const [available, setAvailable] = useState(getIsOnline())

  useEffect(() => {
    const handler = () => {
      setAvailable(getIsOnline() && !!api?.sessionToken)
    }

    window.addEventListener("online", handler)
    window.addEventListener("offline", handler)
    const unsub = api.subscribe(handler)

    handler()

    return () => {
      window.removeEventListener("online", handler)
      window.removeEventListener("offline", handler)
      unsub()
    }
  }, [api])

  return available
}

const getIsOnline = () =>
  !("onLine" in window.navigator && window.navigator.onLine === false)
