import type { TagFilterMode } from "@open-event-systems/schedule-react"
import { createContext, use, useState } from "react"
import { createStore, type StoreApi } from "zustand"

declare module "@tanstack/react-router" {
  interface HistoryState {
    filterDialogOpen?: boolean
    tagFilterMode?: TagFilterMode
    disabledTags?: readonly string[]
  }
}


export type FilterDialogState = Readonly<{
  search?: string
  past?: boolean
  tagFilterMode?: TagFilterMode
  disabledTags?: ReadonlySet<string>
  setSearch: (search?: string) => void
  setShowPastEvents: (past?: boolean) => void
  setTagFilterMode: (mode?: TagFilterMode) => void
  setDisabledTags: (disabledTags?: Iterable<string>) => void
  setTagsDisabled: (tags: Iterable<string> | undefined, disabled: boolean) => void
}>

export const createFilterDialogStore = (): StoreApi<FilterDialogState> => createStore<FilterDialogState>()((set) => ({
  setSearch: (search) => set({ search }),
  setShowPastEvents: (past) => set({ past }),
  setTagFilterMode: (mode) => set({ tagFilterMode: mode }),
  setDisabledTags: (tags) => set({ disabledTags: tags ? new Set(tags) : tags }),
  setTagsDisabled: (tags, disabled) => set((prev) => {
    const newSet = new Set(prev.disabledTags)
    for (const tag of tags ?? []) {
      if (disabled) {
        newSet.add(tag)
      } else {
        newSet.delete(tag)
      }
    }
    return { disabledTags: newSet }
  })
}))

export const useCreateFilterDialogStore = (): StoreApi<FilterDialogState> => {
  const [store] = useState(() => createFilterDialogStore())
  return store
}

export const FilterDialogStoreContext = createContext<StoreApi<FilterDialogState> | null>(null)

export const useFilterDialogStore = (): StoreApi<FilterDialogState> => {
  const store = use(FilterDialogStoreContext)
  if (!store) {
    throw new Error("FilterDialogStoreContext not provided")
  }
  return store
}