import {
  PastEventsFilter,
  SelectionsFilter,
  TagFilter,
  TextFilter,
  type PastEventsFilterProps,
  type SelectionsFilterOption,
  type SelectionsFilterProps,
  type TagFilterMode,
  type TagFilterProps,
  type TextFilterProps,
} from "@open-event-systems/schedule-react"
import {
  useLocation,
  useNavigate,
  useRouter,
  useSearch,
} from "@tanstack/react-router"
import { useCallback, useEffect, useState, type ChangeEvent } from "react"
import { useFilterDialogStore } from "../../hooks/filter.js"
import { useStore } from "zustand"

export const SelectionsFilterContainer = (props: SelectionsFilterProps) => {
  const onlyBookmarked = useSearch({
    strict: false,
    select: (search) => search.bookmarked,
  })

  const onlyUnvisited = useSearch({
    strict: false,
    select: (search) => search.unvisited,
  })

  const router = useRouter()

  const getHref = useCallback(
    (options: ReadonlySet<SelectionsFilterOption>) => {
      return router.history.createHref(
        router.buildLocation({
          to: ".",
          search: (prev) => {
            const updated = { ...prev }

            if (options.has("bookmarked")) {
              updated.bookmarked = true
            } else {
              delete updated.bookmarked
            }

            if (options.has("unvisited")) {
              updated.unvisited = true
            } else {
              delete updated.unvisited
            }

            return updated
          },
          hash: true,
        }).href,
      )
    },
    [router],
  )

  const navigate = useNavigate()

  const onChange = useCallback(
    (value: ReadonlySet<SelectionsFilterOption>) =>
      navigate({
        to: ".",
        search: (prev) => {
          const updated = { ...prev }

          if (value.has("bookmarked")) {
            updated.bookmarked = true
          } else {
            delete updated.bookmarked
          }

          if (value.has("unvisited")) {
            updated.unvisited = true
          } else {
            delete updated.unvisited
          }

          return updated
        },
        replace: true,
        state: true,
        hash: true,
      }),
    [navigate],
  )

  const value: SelectionsFilterOption[] = []

  if (onlyBookmarked) {
    value.push("bookmarked")
  }

  if (onlyUnvisited) {
    value.push("unvisited")
  }

  return (
    <SelectionsFilter
      {...props}
      value={value}
      onChange={onChange}
      getHref={getHref}
    />
  )
}

export const TextFilterContainer = (
  props: TextFilterProps & { dialog?: boolean },
) => {
  const { dialog, ...other } = props

  const dialogStore = useFilterDialogStore()

  const dialogSetValue = useStore(dialogStore, (state) => state.setSearch)

  const search = useSearch({
    strict: false,
    select: (search) => search.search,
  })

  const [curValue, setCurValue] = useState(() => search ?? "")

  const navigate = useNavigate()

  const setValue = useCallback(
    (value: string) =>
      navigate({
        to: ".",
        search: (prev) => {
          const updated = { ...prev }
          if (value) {
            updated.search = value
          } else {
            delete updated.search
          }

          return updated
        },
        replace: true,
        state: true,
        hash: true,
      }),
    [navigate, dialog],
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setValue(curValue)
    }, 300)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [curValue, setValue])

  return (
    <TextFilter
      {...other}
      value={curValue}
      onChange={(e) => {
        if (dialog) {
          dialogSetValue(e.target.value)
        }
        setCurValue(e.target.value)
      }}
    />
  )
}

export const PastEventsFilterContainer = (
  props: PastEventsFilterProps & { dialog?: boolean },
) => {
  const { dialog, ...other } = props

  const filterDialogStore = useFilterDialogStore()

  const dialogSetPast = useStore(
    filterDialogStore,
    (state) => state.setShowPastEvents,
  )

  const showPast = useSearch({
    strict: false,
    select: (search) => search.past,
  })

  const navigate = useNavigate()

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (dialog) {
        dialogSetPast(!e.target.checked)
      }
      navigate({
        to: ".",
        search: (prev) => ({ ...prev, past: !e.target.checked }),
        replace: true,
        state: true,
        hash: true,
      })
    },
    [navigate, dialog, dialogSetPast],
  )

  // TODO: handle page default

  return <PastEventsFilter {...other} checked={!showPast} onChange={onChange} />
}

export const TagFilterContainer = (
  props: TagFilterProps & { dialog?: boolean },
) => {
  const { dialog, ...other } = props

  const filterDialogStore = useFilterDialogStore()

  const dialogSetFilterMode = useStore(
    filterDialogStore,
    (state) => state.setTagFilterMode,
  )
  const dialogSetTagsDisabled = useStore(
    filterDialogStore,
    (state) => state.setTagsDisabled,
  )

  const tagFilterMode = useLocation({
    select: ({ state }) => state.tagFilterMode,
  })
  const disabledTags = useLocation({
    select: ({ state }) => state.disabledTags,
  })

  const navigate = useNavigate()

  const setMode = useCallback(
    (mode: TagFilterMode) => {
      if (dialog) {
        dialogSetFilterMode(mode)
      }

      navigate({
        state: (prev) => ({ ...prev, tagFilterMode: mode }),
        replace: true,
        search: true,
        hash: true,
      })
    },
    [navigate, dialog, dialogSetFilterMode],
  )

  const setTagsDisabled = useCallback(
    (tags: string[], disabled: boolean) => {
      if (dialog) {
        dialogSetTagsDisabled(tags, disabled)
      }

      navigate({
        state: (prev) => {
          const newSet = new Set(prev.disabledTags)
          if (disabled) {
            tags.forEach((t) => newSet.add(t))
          } else {
            tags.forEach((t) => newSet.delete(t))
          }
          return { ...prev, disabledTags: [...newSet] }
        },
        replace: true,
        search: true,
        hash: true,
      })
    },
    [navigate, dialog, dialogSetTagsDisabled],
  )

  return (
    <TagFilter
      {...other}
      mode={tagFilterMode}
      disabledTags={disabledTags}
      onSetMode={setMode}
      onSetDisabled={setTagsDisabled}
    />
  )
}
