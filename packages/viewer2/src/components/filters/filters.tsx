import {
  BookmarkFilter,
  PastEventsFilter,
  TagFilter,
  TextFilter,
  ViewSelect,
  type BookmarkFilterProps,
  type PastEventsFilterProps,
  type TagFilterProps,
  type TextFilterProps,
  type ViewSelectProps,
} from "@open-event-systems/schedule-react"
import { FilterStateStoreContext } from "../../filter.js"
import { useRequiredContext } from "../../utils.js"
import { useStore } from "zustand"
import { useShallow } from "zustand/react/shallow"
import { useCallback, type ChangeEvent } from "react"
import { useViewerConfig } from "../../config.js"
import { useNavigate, useSearch } from "@tanstack/react-router"

export const ViewSelectContainer = (props: ViewSelectProps) => {
  const navigate = useNavigate()

  return (
    <ViewSelect
      {...props}
      onChange={(t) => {
        navigate({
          to: ".",
          params: true,
          state: true,
          hash: true,
          search: (cur) => ({
            ...cur,
            ...(t ? { view: t } : {}),
          }),
          replace: true,
        })
      }}
    />
  )
}

export const BookmarkFilterContainer = (props: BookmarkFilterProps) => {
  // TODO: allow configurable default/fixed value from page config
  const onlyBookmarked = useSearch({
    strict: false,
    select: (state) => !!state.bookmarked,
  })
  const navigate = useNavigate()

  return (
    <BookmarkFilter
      {...props}
      value={onlyBookmarked}
      onChange={(bookmarked) => {
        navigate({
          to: ".",
          params: true,
          state: true,
          hash: true,
          search: (cur) => ({
            ...cur,
            bookmarked: bookmarked,
          }),
          replace: true,
        })
      }}
    />
  )
}

export const TextFilterContainer = (props: TextFilterProps) => {
  const store = useRequiredContext(FilterStateStoreContext)
  const [text, setText] = useStore(
    store,
    useShallow((state) => [state.text, state.setText]),
  )

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value)
    },
    [setText],
  )

  return <TextFilter {...props} value={text} onChange={onChange} />
}

export const TagFilterContainer = (props: TagFilterProps) => {
  const config = useViewerConfig()
  const store = useRequiredContext(FilterStateStoreContext)
  const [disabledTags, setTagDisabled] = useStore(
    store,
    useShallow((state) => [state.disabledTags, state.setTagDisabled]),
  )

  return (
    <TagFilter
      {...props}
      tagIndicators={config.tagIndicators}
      disabledTags={disabledTags}
      onSetDisabled={setTagDisabled}
    />
  )
}

export const PastEventsFilterContainer = (props: PastEventsFilterProps) => {
  // TODO: allow configurable default/fixed value?
  const past = useSearch({ strict: false, select: (state) => !!state.past })
  const navigate = useNavigate()

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      navigate({
        to: ".",
        params: true,
        state: true,
        hash: true,
        search: (cur) => ({
          ...cur,
          past: e.target.checked,
        }),
        replace: true,
      })
    },
    [navigate],
  )

  return <PastEventsFilter {...props} checked={past} onChange={onChange} />
}
