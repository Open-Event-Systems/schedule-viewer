/**
 * Filter state that is stored in the location state.
 * @module
 */

import { omitUndef } from "@open-event-systems/schedule-lib"
import type {
  SelectionsFilterOption,
  SetDisabledTagsFunc,
  TagFilterMode,
} from "@open-event-systems/schedule-react"
import {
  useLocation,
  useNavigate,
  useRouter,
  useSearch,
} from "@tanstack/react-router"
import { useCallback, useMemo } from "react"
import z from "zod"

declare module "@tanstack/react-router" {
  interface HistoryState {
    tagFilterMode?: TagFilterMode
    disabledTags?: readonly string[]
  }
}

export type PageSearchParams = Readonly<{
  view?: string
  day?: string
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
  view: z.optional(z.string()).catch(undefined),
  day: z.optional(z.string()).catch(undefined),
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

export const useSetSearch = (): ((search: {
  search?: string | null
  showPast?: boolean | null
  selectionsFilterOptions?: Iterable<SelectionsFilterOption> | null
  tagFilterMode?: TagFilterMode | null
  disabledTags?: Iterable<string> | null
}) => void) => {
  const navigate = useNavigate()
  return useCallback(
    (search: {
      search?: string | null
      showPast?: boolean | null
      selectionsFilterOptions?: Iterable<SelectionsFilterOption> | null
      tagFilterMode?: TagFilterMode | null
      disabledTags?: Iterable<string> | null
    }) =>
      navigate({
        to: ".",
        search: (prev) => {
          let newObj = { ...prev }
          if (search.search) {
            newObj.search = search.search
          } else {
            delete newObj.search
          }

          if (search.showPast != null) {
            newObj.past = !!search.showPast
          } else {
            delete newObj.past
          }

          newObj = getSelectionsFilterParams(
            newObj,
            search.selectionsFilterOptions,
          )

          return newObj
        },
        state: (prev) => {
          const newObj = { ...prev }

          if (search.tagFilterMode) {
            newObj.tagFilterMode = search.tagFilterMode
          } else {
            delete newObj.tagFilterMode
          }

          if (search.disabledTags) {
            newObj.disabledTags = [...search.disabledTags]
          } else {
            delete newObj.disabledTags
          }

          return newObj
        },
        hash: true,
        replace: true,
      }),
    [navigate],
  )
}

export const useTagFilterModeState = (): [
  TagFilterMode | undefined,
  (mode: TagFilterMode) => void,
] => {
  const navigate = useNavigate()
  const setState = useCallback(
    (mode: TagFilterMode) =>
      navigate({
        to: ".",
        state: (prev) => ({ ...prev, tagFilterMode: mode }),
        search: true,
        hash: true,
        replace: true,
      }),
    [navigate],
  )

  const state = useLocation({
    select: ({ state }) => state.tagFilterMode,
  })

  return [state, setState]
}

export const useDisabledTagsState = (): [
  ReadonlySet<string>,
  SetDisabledTagsFunc,
] => {
  const navigate = useNavigate()
  const setState = useCallback(
    (tags?: Iterable<string> | null, disabled?: boolean) =>
      navigate({
        to: ".",
        state: (prev) => {
          if (disabled != null) {
            // partial update
            const newSet = new Set(prev.disabledTags)
            for (const tag of tags ?? []) {
              if (disabled) {
                newSet.add(tag)
              } else {
                newSet.delete(tag)
              }
            }
            return { ...prev, disabledTags: [...newSet] }
          } else {
            return { ...prev, disabledTags: [...(tags ?? [])] }
          }
        },
        search: true,
        hash: true,
        replace: true,
      }),
    [navigate],
  )

  const tagsState = useLocation({
    select: ({ state }) => state.disabledTags,
    structuralSharing: true,
  })

  const state = useMemo(() => new Set(tagsState), [tagsState])

  return [state, setState]
}

export const useSearchState = (): [
  string | undefined,
  (search?: string | null) => void,
] => {
  const navigate = useNavigate()
  const setState = useCallback(
    (search?: string | null) =>
      navigate({
        to: ".",
        search: (prev) => {
          const newObj = { ...prev }
          if (search) {
            newObj.search = search
          } else {
            delete newObj.search
          }
          return newObj
        },
        state: true,
        hash: true,
        replace: true,
      }),
    [navigate],
  )

  const state = useLocation({ select: ({ search }) => search.search })

  return [state, setState]
}

export const useShowPastEventsState = (): [
  boolean | undefined,
  (show?: boolean | null) => void,
] => {
  const navigate = useNavigate()
  const setState = useCallback(
    (show?: boolean | null) =>
      navigate({
        to: ".",
        search: (prev) => {
          const newObj = { ...prev }
          if (show != null) {
            newObj.past = show
          } else {
            delete newObj.past
          }
          return newObj
        },
        state: true,
        hash: true,
        replace: true,
      }),
    [navigate],
  )

  const state = useSearch({ strict: false, select: (search) => search.past })
  return [state, setState]
}

export const useSelectionsFilterState = (): [
  ReadonlySet<SelectionsFilterOption>,
  (options?: Iterable<SelectionsFilterOption> | null) => void,
] => {
  const navigate = useNavigate()
  const setState = useCallback(
    (options?: Iterable<SelectionsFilterOption> | null) =>
      navigate({
        to: ".",
        search: (prev) => getSelectionsFilterParams(prev, options),
        state: true,
        hash: true,
        replace: true,
      }),
    [navigate],
  )

  const { bookmarked, unvisited } = useSearch({
    strict: false,
    structuralSharing: true,
    select: ({ bookmarked, unvisited }) => ({
      bookmarked: !!bookmarked,
      unvisited: !!unvisited,
    }),
  })

  const state = useMemo(() => {
    const set = new Set<SelectionsFilterOption>()
    if (bookmarked) {
      set.add("bookmarked")
    }
    if (unvisited) {
      set.add("unvisited")
    }
    return set
  }, [bookmarked, unvisited])

  return [state, setState]
}

export const useGetSelectionsFilterStateHref = (): ((
  options?: Iterable<SelectionsFilterOption> | null,
) => string) => {
  const router = useRouter()
  return useCallback(
    (options?: Iterable<SelectionsFilterOption> | null) => {
      return router.history.createHref(
        router.buildLocation({
          to: ".",
          search: (prev) => getSelectionsFilterParams(prev, options),
          state: true,
          hash: true,
        }).href,
      )
    },
    [router],
  )
}

const getSelectionsFilterParams = <T extends PageSearchParams>(
  prev: T,
  opts?: Iterable<SelectionsFilterOption> | null,
): T => {
  const newObj: { -readonly [K in keyof T]: T[K] } = { ...prev }
  const optSet = new Set(opts)

  if (optSet.has("bookmarked")) {
    newObj.bookmarked = true
  } else {
    delete newObj.bookmarked
  }

  if (optSet.has("unvisited")) {
    newObj.unvisited = true
  } else {
    delete newObj.unvisited
  }

  return newObj
}
