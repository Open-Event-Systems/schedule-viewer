import {
  useFilterDialogOpenState,
  useThrottledSetSearch,
} from "#src/hooks/filter-dialog.js"
import {
  useGetSelectionsFilterStateHref,
  useLocationFilterActions,
} from "#src/hooks/filter-location-state.js"
import {
  PastEventsFilter,
  SelectionsFilter,
  TagFilter,
  TextFilter,
  useFilterStore,
  useSSRValue,
  ViewSelect,
  type PastEventsFilterProps,
  type SelectionsFilterOption,
  type SelectionsFilterProps,
  type TagFilterProps,
  type TextFilterProps,
  type ViewSelectProps,
} from "@open-event-systems/schedule-react"
import { useLocation, useSearch } from "@tanstack/react-router"
import { useMemo } from "react"

export const ViewSelectContainer = (props: ViewSelectProps) => {
  return <ViewSelect {...props} />
}

export const SelectionsFilterContainer = (props: SelectionsFilterProps) => {
  const locValueArr = useSearch({
    strict: false,
    structuralSharing: true,
    select: ({ bookmarked, unvisited }) => {
      const opts: SelectionsFilterOption[] = []
      if (bookmarked) {
        opts.push("bookmarked")
      }
      if (unvisited) {
        opts.push("unvisited")
      }

      return opts
    },
  })

  const value = useMemo(() => new Set(locValueArr), [locValueArr])
  const setValue = useLocationFilterActions(
    (state) => state.setSelectionsFilterOptions,
  )

  const getHref = useGetSelectionsFilterStateHref()

  return (
    <SelectionsFilter
      {...props}
      value={useSSRValue(value, undefined)}
      onChange={setValue}
      getHref={getHref}
    />
  )
}

export const TextFilterContainer = (props: TextFilterProps) => {
  const [isDialogOpen] = useFilterDialogOpenState()
  const setLocSearch = useLocationFilterActions((state) => state.setSearch)

  const stateSearch = useFilterStore((state) => state.search)
  const setStateSearch = useFilterStore((state) => state.setSearch)

  useThrottledSetSearch(!isDialogOpen, stateSearch, setLocSearch)

  return (
    <TextFilter
      {...props}
      value={useSSRValue(stateSearch, "") || ""}
      onChange={(e) => {
        setStateSearch(e.target.value)
      }}
    />
  )
}

export const PastEventsFilterContainer = (props: PastEventsFilterProps) => {
  // TODO: handle page default

  const [isDialogOpen] = useFilterDialogOpenState()
  const locHidePast = useSearch({
    strict: false,
    select: (search) => (search.past != null ? !search.past : true),
  })
  const setLocHidePast = useLocationFilterActions((state) => state.setHidePast)

  const stateHidePast = useFilterStore((state) =>
    state.hidePast != null ? state.hidePast : true,
  )
  const setStateHidePast = useFilterStore((state) => state.setHidePast)

  return (
    <PastEventsFilter
      {...props}
      checked={useSSRValue(
        isDialogOpen ? !!stateHidePast : !!locHidePast,
        true,
      )}
      onChange={(e) =>
        isDialogOpen
          ? setStateHidePast(e.target.checked)
          : setLocHidePast(e.target.checked)
      }
    />
  )
}

export const TagFilterContainer = (props: TagFilterProps) => {
  const [isDialogOpen] = useFilterDialogOpenState()

  const locTagFilterMode = useLocation({
    select: ({ state }) => state.tagFilterMode,
  })
  const setLocTagFilterMode = useLocationFilterActions(
    (state) => state.setTagFilterMode,
  )

  const stateTagFilterMode = useFilterStore((state) => state.tagFilterMode)
  const setStateTagFilterMode = useFilterStore(
    (state) => state.setTagFilterMode,
  )

  const locDisabledTags = useLocation({
    select: ({ state }) => state.disabledTags,
  })
  const setLocDisabledTags = useLocationFilterActions(
    (state) => state.setDisabledTags,
  )

  const stateDisabledTags = useFilterStore((state) => state.disabledTags)
  const setStateDisabledTags = useFilterStore((state) => state.setDisabledTags)

  return (
    <TagFilter
      {...props}
      mode={useSSRValue(
        isDialogOpen ? stateTagFilterMode : locTagFilterMode,
        undefined,
      )}
      disabledTags={useSSRValue(
        isDialogOpen ? stateDisabledTags : locDisabledTags,
        undefined,
      )}
      onSetMode={isDialogOpen ? setStateTagFilterMode : setLocTagFilterMode}
      onSetDisabled={isDialogOpen ? setStateDisabledTags : setLocDisabledTags}
    />
  )
}
