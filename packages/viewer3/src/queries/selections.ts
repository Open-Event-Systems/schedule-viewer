import type { Selections, SelectionsService, SelectionsStore, SelectionsType } from "@open-event-systems/schedule-lib"
import { mutationOptions, queryOptions } from "@tanstack/react-query"
import type { AwaitedAppContextValue } from "../hooks/app.js"

export const SelectionsQueryKey = {
  byId: (id: string) => ["selections", id] as const,
  sessionSelections: (type: string) => ["sessionSelections", type] as const,
} as const

export const SelectionsMutationKey = {
  setSessionSelections: (type: SelectionsType) => ["sessionSelections", type] as const,
}

export const SelectionsQueryOptions = {
  byId: (service: SelectionsService | null | undefined, id: string) => queryOptions({
    queryKey: SelectionsQueryKey.byId(id),
    queryFn: async () => {
      if (!service) {
        return null
      }

      return service.getById(id)
    },
    staleTime: Infinity,
  }),
  sessionSelections: (store: SelectionsStore, type: SelectionsType) => queryOptions({
    queryKey: SelectionsQueryKey.sessionSelections(type),
    queryFn: async () => {
      return store.load(type)
    },
    staleTime: 300000,
  })
} as const

export const SelectionsMutationOption = {
  setSessionSelections: (store: SelectionsStore, type: SelectionsType) => mutationOptions({
    mutationKey: SelectionsMutationKey.setSessionSelections(type),
    mutationFn: async (newSelections: Selections) => {
      return await store.save(type, newSelections)
    }
  })
}

export const SelectionsLoader = {
  sessionSelections: async (contextPromise: Promise<AwaitedAppContextValue>, type: SelectionsType) => {
    const { queryClient, selectionsStore } = await contextPromise
    return queryClient.query({ ...SelectionsQueryOptions.sessionSelections(selectionsStore, type), staleTime: "static" })
  }
}