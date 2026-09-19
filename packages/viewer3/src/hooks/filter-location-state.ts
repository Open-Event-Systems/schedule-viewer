/**
 * Filter state that is stored in the location state.
 * @module
 */

import { omitUndef } from "@open-event-systems/schedule-lib"
import {
  createOptionalContext,
  FilterStoreContext,
  makeFilterActions,
  makeUseBoundStore,
  useFilterStore,
  useRequiredContext,
  type FilterActions,
  type FilterOptions,
  type SelectionsFilterOption,
  type TagFilterMode,
} from "@open-event-systems/schedule-react"
import {
  useLocation,
  useNavigate,
  useRouter,
  type HistoryState,
} from "@tanstack/react-router"
import { useCallback, useEffect, useMemo, useRef } from "react"
import z from "zod"
import { createStore, type StoreApi } from "zustand"

declare module "@tanstack/react-router" {
  interface HistoryState {
    tagFilterMode?: TagFilterMode
    disabledTags?: readonly string[]
  }
}

export type PageSearchParams = Readonly<{
  search?: string
  past?: boolean
  bookmarked?: boolean
  unvisited?: boolean
}>

const boolSchema = z.codec(
  z.union([z.literal(["true", "false"]), z.boolean()]),
  z.boolean(),
  {
    decode: (v) => v === true || v == "true",
    encode: (v) => (v ? "true" : "false"),
  },
)

const pageSearchParamsSchema = z.object({
  search: z.optional(z.string()).catch(undefined),
  past: z.optional(boolSchema).catch(undefined),
  bookmarked: z.optional(boolSchema).catch(undefined),
  unvisited: z.optional(boolSchema).catch(undefined),
})

/**
 * Parse the search settings from the search params.
 */
export const parseSearchParams = (
  search: Record<string, unknown>,
): PageSearchParams => {
  return omitUndef(pageSearchParamsSchema.parse(search))
}

export const LocationFilterActionsContext =
  createOptionalContext<StoreApi<FilterActions>>()

export const useLocationFilterActions = makeUseBoundStore(() =>
  useRequiredContext(LocationFilterActionsContext),
)

export const useGetSelectionsFilterStateHref = (): ((
  options?: Iterable<SelectionsFilterOption> | null,
) => string) => {
  const router = useRouter()

  // href will change whenever search or hash changes
  const hrefData = useLocation({
    structuralSharing: true,
    select: ({ hash, searchStr }) => [hash, searchStr],
  })

  return useCallback(
    (options?: Iterable<SelectionsFilterOption> | null) => {
      return router.history.createHref(
        router.buildLocation({
          to: ".",
          search: (prev) => {
            const prevOpts = searchToFilterOptions(prev)
            const newSearch = filterOptionsToSearch({
              ...prevOpts,
              selectionsFilterOptions: new Set(options),
            })
            return { ...prev, ...newSearch }
          },
          state: true,
          hash: true,
        }).href,
      )
    },
    [router, hrefData],
  )
}

export const useMakeLocationFilterActions = (): StoreApi<FilterActions> => {
  const navigate = useNavigate()

  const store = useMemo(() => {
    const updateFunc = (update: (prev: FilterOptions) => FilterOptions) => {
      navigate({
        to: ".",
        search: (prev) => {
          const prevOpts = searchToFilterOptions(prev)
          const newOpts = update(prevOpts)
          return { ...prev, ...filterOptionsToSearch(newOpts) }
        },
        state: (prev) => {
          const prevOpts = stateToFilterOptions(prev)
          const newOpts = update(prevOpts)
          return { ...prev, ...filterOptionsToState(newOpts) }
        },
        hash: true,
        replace: true,
      })
    }

    const filterActions = makeFilterActions(updateFunc)

    return createStore<FilterActions>()(() => ({
      ...filterActions,
    }))
  }, [navigate])

  return store
}

export const useSyncFilterDialogState = (dialogOpen: boolean) => {
  const prevOpen = useRef(dialogOpen)

  const router = useRouter()
  const navigate = useNavigate()

  const setStoreOptions = useFilterStore((state) => state.replaceOptions)
  const getStoreState = useRequiredContext(FilterStoreContext).getState

  const copyToStore = useCallback(() => {
    const search = parseSearchParams(router.state.location.search)
    const searchOpts = searchToFilterOptions(search)
    const stateOpts = stateToFilterOptions(router.state.location.state)
    const opts = { ...searchOpts, ...stateOpts }
    setStoreOptions(opts)
  }, [router, setStoreOptions])

  const copyToLoc = useCallback(() => {
    const cur = getStoreState()
    const search = filterOptionsToSearch(cur)
    const state = filterOptionsToState(cur)
    navigate({
      to: ".",
      search: (prev) => {
        return { ...prev, ...search }
      },
      state: (prev) => {
        return { ...prev, ...state }
      },
      hash: true,
      replace: true,
    })
  }, [navigate, getStoreState])

  // also copy on first render
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      copyToStore()
    }
  }, [copyToStore])

  useEffect(() => {
    if (dialogOpen && !prevOpen.current) {
      copyToStore()
    } else if (!dialogOpen && prevOpen.current) {
      copyToLoc()
    }

    prevOpen.current = dialogOpen
  }, [dialogOpen, copyToStore, copyToLoc])
}

const searchToFilterOptions = (search: PageSearchParams): FilterOptions => {
  const opts: { -readonly [K in keyof FilterOptions]: FilterOptions[K] } = {}

  const selectionsFilterOptions = new Set<SelectionsFilterOption>()

  if (search.bookmarked) {
    selectionsFilterOptions.add("bookmarked")
  }

  if (search.unvisited) {
    selectionsFilterOptions.add("unvisited")
  }

  opts.selectionsFilterOptions = selectionsFilterOptions
  opts.search = search.search

  if (search.past != null) {
    opts.hidePast = !search.past
  }

  return opts
}

const stateToFilterOptions = (state: HistoryState): FilterOptions => {
  return {
    tagFilterMode: state.tagFilterMode,
    disabledTags: new Set(state.disabledTags),
  }
}

const filterOptionsToSearch = (opts: FilterOptions): PageSearchParams => {
  const params: {
    -readonly [K in keyof PageSearchParams]: PageSearchParams[K]
  } = {
    bookmarked: undefined,
    unvisited: undefined,
    search: undefined,
  }

  if (opts.selectionsFilterOptions?.has("bookmarked")) {
    params.bookmarked = true
  }

  if (opts.selectionsFilterOptions?.has("unvisited")) {
    params.unvisited = true
  }

  if (opts.search) {
    params.search = opts.search
  }

  if (opts.hidePast != null) {
    params.past = !opts.hidePast
  }

  return params
}

const filterOptionsToState = (opts: FilterOptions): HistoryState => {
  return {
    tagFilterMode: opts.tagFilterMode,
    disabledTags: [...(opts.disabledTags ?? [])],
  }
}
