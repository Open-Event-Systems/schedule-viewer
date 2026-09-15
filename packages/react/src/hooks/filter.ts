/**
 * Item filtering tools.
 * @module
 */

import type { SelectionsFilterOption } from "#src/components/filters/selections-filter.js"
import {
  createOptionalContext,
  makeUseBoundStore,
  useRequiredContext,
} from "#src/utils.js"
import {
  getDefaultDay,
  iterToArr,
  makeSetDisabledTagsFunc,
  type Day,
  type SetDisabledTagsFunc,
  type TagFilterMode,
} from "@open-event-systems/schedule-lib"
import type { Dayjs } from "dayjs"
import { useMemo, useState } from "react"
import { createStore, type StoreApi } from "zustand"

export type FilterOptions = Readonly<{
  selectionsFilterOptions?: ReadonlySet<SelectionsFilterOption>
  search?: string
  hidePast?: boolean
  tagFilterMode?: TagFilterMode
  disabledTags?: ReadonlySet<string>
}>

export type FilterActions = Readonly<{
  setSelectionsFilterOptions: (
    options?: Iterable<SelectionsFilterOption> | null,
  ) => void
  setSearch: (search?: string | null) => void
  setHidePast: (hidePast?: boolean | null) => void
  setTagFilterMode: (tagFilterMode?: TagFilterMode | null) => void
  setDisabledTags: SetDisabledTagsFunc
  replaceOptions: (newOptions: FilterOptions) => void
}>

export const makeFilterActions = (
  set: (update: (prev: FilterOptions) => FilterOptions) => void,
): FilterActions => {
  return {
    setSelectionsFilterOptions: (options) =>
      set((prev) => ({ ...prev, selectionsFilterOptions: new Set(options) })),
    setSearch: (search) =>
      set((prev) => ({ ...prev, search: search ?? undefined })),
    setHidePast: (hidePast) =>
      set((prev) => ({ ...prev, hidePast: hidePast ?? undefined })),
    setTagFilterMode: (tagFilterMode) =>
      set((prev) => ({ ...prev, tagFilterMode: tagFilterMode ?? undefined })),
    setDisabledTags: makeSetDisabledTagsFunc((update) => {
      set((prev) => {
        const newVal = update(prev.disabledTags)
        return { ...prev, disabledTags: newVal }
      })
    }),
    replaceOptions: (newOptions) => {
      set(() => newOptions)
    },
  }
}

export const createFilterStore = (
  initialState?: FilterOptions,
): StoreApi<FilterOptions & FilterActions> =>
  createStore<FilterOptions & FilterActions>()((set) => {
    const updateFunc = (update: (prev: FilterOptions) => FilterOptions) => {
      set(
        ({
          setSelectionsFilterOptions,
          setSearch,
          setHidePast,
          setTagFilterMode,
          setDisabledTags,
          replaceOptions,
          ...prevOpts
        }) => {
          const newOpts = update(prevOpts)
          return {
            ...newOpts,
            setSelectionsFilterOptions,
            setSearch,
            setHidePast,
            setTagFilterMode,
            setDisabledTags,
            replaceOptions,
          }
        },
        true,
      )
    }

    return {
      ...initialState,
      ...makeFilterActions(updateFunc),
    }
  })

export const FilterStoreContext =
  createOptionalContext<StoreApi<FilterOptions & FilterActions>>()

export const useCreateFilterStore = (
  initialData?: FilterOptions,
): StoreApi<FilterOptions & FilterActions> =>
  useState(() => createFilterStore(initialData))[0]

export const useFilterStore = makeUseBoundStore(() =>
  useRequiredContext(FilterStoreContext),
)

/**
 * Get the selected {@link Day} (or the default day) in a day filter.
 */
export const getSelectedDay = (
  days: Iterable<Day> | null | undefined,
  key: string | null | undefined,
  _defaultDay?: Day,
): Day | undefined => {
  const daysArr = iterToArr(days)
  const obj = daysArr.find((d) => d.key == key)
  return obj ?? _defaultDay
}

/**
 * Hook to return the selected {@link Day} or the default day in a day filter.
 */
export const useSelectedDay = (
  days: Iterable<Day> | null | undefined,
  key: string | null | undefined,
  now: Dayjs,
): Day | undefined =>
  useMemo(() => {
    const defaultDay = getDefaultDay(days, now)
    return getSelectedDay(days, key, defaultDay)
  }, [days, key, now])
