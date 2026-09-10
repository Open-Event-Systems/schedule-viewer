import {
  PastEventsFilter,
  SelectionsFilter,
  TagFilter,
  TextFilter,
  type PastEventsFilterProps,
  type SelectionsFilterProps,
  type TagFilterProps,
  type TextFilterProps,
} from "@open-event-systems/schedule-react"
import { useSSRValue } from "../../hooks/app.js"
import {
  useDisabledTagsState as useDialogDisabledTagsState,
  useSearchState as useDialogSearchState,
  useShowPastEventsState as useDialogShowPastEventsState,
  useTagFilterModeState as useDialogTagFilterModeState,
  useFilterDialogOpenState,
  useThrottledSetSearch,
} from "../../hooks/filter-dialog.js"
import {
  useGetSelectionsFilterStateHref,
  useDisabledTagsState as useLocDisabledTagsState,
  useSearchState as useLocSearchState,
  useShowPastEventsState as useLocShowPastEventsState,
  useTagFilterModeState as useLocTagFilterModeState,
  useSelectionsFilterState,
} from "../../hooks/filter-location-state.js"

export const SelectionsFilterContainer = (props: SelectionsFilterProps) => {
  const [value, onChange] = useSelectionsFilterState()
  const getHref = useGetSelectionsFilterStateHref()

  return (
    <SelectionsFilter
      {...props}
      value={useSSRValue(value, undefined)}
      onChange={onChange}
      getHref={getHref}
    />
  )
}

export const TextFilterContainer = (props: TextFilterProps) => {
  const [isDialogOpen] = useFilterDialogOpenState()
  const [_locSearch, setLocSearch] = useLocSearchState()
  const [dialogSearch, setDialogSearch] = useDialogSearchState()

  useThrottledSetSearch(!isDialogOpen, dialogSearch, setLocSearch)

  return (
    <TextFilter
      {...props}
      value={useSSRValue(dialogSearch, "")}
      onChange={(e) => {
        setDialogSearch(e.target.value)
      }}
    />
  )
}

export const PastEventsFilterContainer = (props: PastEventsFilterProps) => {
  // TODO: handle page default

  const [isDialogOpen] = useFilterDialogOpenState()
  const [locShowPast, setLocShowPast] = useLocShowPastEventsState()
  const [dialogShowPast, setDialogShowPast] = useDialogShowPastEventsState()

  return (
    <PastEventsFilter
      {...props}
      checked={useSSRValue(
        !(isDialogOpen ? dialogShowPast : !!locShowPast),
        true,
      )}
      onChange={(e) =>
        isDialogOpen
          ? setDialogShowPast(!e.target.checked)
          : setLocShowPast(!e.target.checked)
      }
    />
  )
}

export const TagFilterContainer = (props: TagFilterProps) => {
  const [isDialogOpen] = useFilterDialogOpenState()

  const [locTagFilterMode, setLocTagFilterMode] = useLocTagFilterModeState()

  const [dialogTagFilterMode, setDialogTagFilterMode] =
    useDialogTagFilterModeState()

  const [locDisabledTags, setLocDisabledTags] = useLocDisabledTagsState()
  const [dialogDisabledTags, setDialogDisabledTags] =
    useDialogDisabledTagsState()

  return (
    <TagFilter
      {...props}
      mode={useSSRValue(
        isDialogOpen ? dialogTagFilterMode : locTagFilterMode,
        undefined,
      )}
      disabledTags={useSSRValue(
        isDialogOpen ? dialogDisabledTags : locDisabledTags,
        undefined,
      )}
      onSetMode={isDialogOpen ? setDialogTagFilterMode : setLocTagFilterMode}
      onSetDisabled={isDialogOpen ? setDialogDisabledTags : setLocDisabledTags}
    />
  )
}
