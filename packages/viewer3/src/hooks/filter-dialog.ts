/**
 * Filter state controlled by the filter dialog.
 * @module
 */

import {
  createOptionalContext,
  useRequiredContext,
  type SelectionsFilterOption,
  type SetDisabledTagsFunc,
  type TagFilterMode,
} from "@open-event-systems/schedule-react"
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { createStore, type StoreApi } from "zustand"
import { makeBoundedUseStore } from "../utils.js"
import { parseSearchParams, useSetSearch } from "./filter-location-state.js"

declare module "@tanstack/react-router" {
  interface HistoryState {
    filterDialogOpen?: true
  }
}

export const useFilterDialogOpenState = (): [
  boolean,
  (open: boolean) => void,
] => {
  const navigate = useNavigate()
  const router = useRouter()
  const setState = useCallback(
    (open: boolean) => {
      if (open) {
        navigate({
          to: ".",
          state: (prev) => ({ ...prev, filterDialogOpen: true }),
          search: true,
          hash: true,
        })
      } else {
        router.history.go(-1)
      }
    },
    [navigate, router],
  )

  const state = useLocation({ select: ({ state }) => !!state.filterDialogOpen })

  return [state, setState]
}

export type FilterDialogState = Readonly<{
  search: string
  showPast: boolean
  tagFilterMode?: TagFilterMode
  disabledTags: ReadonlySet<string>
}>

export type FilterDialogActions = Readonly<{
  setSearch: (search: string) => void
  setShowPast: (show: boolean) => void
  setTagFilterMode: (mode: TagFilterMode) => void
  setDisabledTags: SetDisabledTagsFunc
}>

export type FilterDialogStore = StoreApi<
  FilterDialogState & FilterDialogActions
>

const createFilterDialogStore = (): FilterDialogStore =>
  createStore<FilterDialogState & FilterDialogActions>()((set) => ({
    search: "",
    setSearch: (search) => set({ search }),

    showPast: false,
    setShowPast: (show) => set({ showPast: show }),

    setTagFilterMode: (mode) => set({ tagFilterMode: mode }),

    disabledTags: new Set(),
    setDisabledTags: (tags?: Iterable<string> | null, disabled?: boolean) =>
      set(({ disabledTags }) => {
        if (disabled != null) {
          // partial update
          const newSet = new Set(disabledTags)
          for (const tag of tags ?? []) {
            if (disabled) {
              newSet.add(tag)
            } else {
              newSet.delete(tag)
            }
          }
          return { disabledTags: newSet }
        } else {
          return { disabledTags: new Set(tags) }
        }
      }),
  }))

export const useCreateFilterDialogStore = (): FilterDialogStore =>
  useState(() => createFilterDialogStore())[0]

export const FilterDialogStoreContext =
  createOptionalContext<FilterDialogStore>()

export const useFilterDialogState = makeBoundedUseStore(() =>
  useRequiredContext(FilterDialogStoreContext),
)

export const useSearchState = (): [string, (search: string) => void] => {
  const state = useFilterDialogState((state) => state.search)
  const setState = useFilterDialogState((state) => state.setSearch)
  return [state, setState]
}

export const useShowPastEventsState = (): [
  boolean,
  (show: boolean) => void,
] => {
  const state = useFilterDialogState((state) => state.showPast)
  const setState = useFilterDialogState((state) => state.setShowPast)
  return [state, setState]
}

export const useTagFilterModeState = (): [
  TagFilterMode | undefined,
  (mode: TagFilterMode) => void,
] => {
  const state = useFilterDialogState((state) => state.tagFilterMode)
  const setState = useFilterDialogState((state) => state.setTagFilterMode)
  return [state, setState]
}

export const useDisabledTagsState = (): [
  ReadonlySet<string>,
  SetDisabledTagsFunc,
] => {
  const state = useFilterDialogState((state) => state.disabledTags)
  const setState = useFilterDialogState((state) => state.setDisabledTags)

  return [state, setState]
}

export const useThrottledSetSearch = (
  enabled: boolean,
  search: string,
  setSearch: (search: string) => void,
) => {
  const prevValue = useRef(search)

  useEffect(() => {
    if (search != prevValue.current && enabled) {
      const timeout = window.setTimeout(() => setSearch(search), 300)
      prevValue.current = search
      return () => window.clearTimeout(timeout)
    } else {
      prevValue.current = search
    }
  }, [enabled, search, setSearch])
}

export const useSyncFilterDialogState = (dialogOpen: boolean) => {
  const router = useRouter()
  const dialogStore = useRequiredContext(FilterDialogStoreContext)

  const setLocState = useSetSearch()

  const syncToStore = useCallback(() => {
    const parsedLocSearch = parseSearchParams(router.state.location.search)

    const search = parsedLocSearch.search
    const showPast = parsedLocSearch.past
    const tagFilterMode = router.state.location.state.tagFilterMode
    const disabledTags = router.state.location.state.disabledTags

    dialogStore.setState({
      search: search ?? "",
      showPast: !!showPast,
      tagFilterMode: tagFilterMode,
      disabledTags: new Set(disabledTags),
    })
  }, [router, dialogStore])

  const syncToLoc = useCallback(() => {
    const cur = dialogStore.getState()
    const search = cur.search
    const showPast = cur.showPast

    const selectionsFilterOptions = new Set<SelectionsFilterOption>()

    if (router.state.location.search.bookmarked) {
      selectionsFilterOptions.add("bookmarked")
    }

    if (router.state.location.search.unvisited) {
      selectionsFilterOptions.add("unvisited")
    }

    const tagFilterMode = cur.tagFilterMode
    const disabledTags = cur.disabledTags

    setLocState({
      search,
      showPast,
      tagFilterMode,
      selectionsFilterOptions,
      disabledTags,
    })
  }, [setLocState, router, dialogStore])

  const firstSync = useRef(false)
  useEffect(() => {
    if (!firstSync.current) {
      syncToStore()
      firstSync.current = true
    }
  }, [syncToStore])

  const prevOpen = useRef(dialogOpen)

  useEffect(() => {
    if (dialogOpen && !prevOpen.current) {
      syncToStore()
    } else if (!dialogOpen && prevOpen.current) {
      syncToLoc()
    }

    prevOpen.current = dialogOpen
  }, [dialogOpen, syncToStore, syncToLoc])
}
