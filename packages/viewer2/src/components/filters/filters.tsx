import {
  PastEventsFilter,
  SelectionsFilter,
  TagFilter,
  TextFilter,
  ViewSelect,
  type PastEventsFilterProps,
  type SelectionsFilterOption,
  type SelectionsFilterProps,
  type TagFilterProps,
  type TextFilterProps,
  type ViewSelectProps,
} from "@open-event-systems/schedule-react"
import { FilterStateStoreContext } from "../../filter.js"
import { useRequiredContext } from "../../utils.js"
import { useStore } from "zustand"
import { useShallow } from "zustand/react/shallow"
import { useCallback, type AllHTMLAttributes, type ChangeEvent } from "react"
import { useViewerConfig } from "../../config.js"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"

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

export const SelectionsFilterContainer = (props: SelectionsFilterProps) => {
  const selectionsOpts = useSearch({
    strict: false,
    select: (state) => {
      const opts: SelectionsFilterOption[] = []
      if (state.bookmarked) {
        opts.push("bookmarked")
      }
      if (state.unvisited) {
        opts.push("unvisited")
      }
      return opts
    },
    structuralSharing: true,
  })
  const navigate = useNavigate()
  const router = useRouter()

  const renderButton = useCallback(
    (
      props: AllHTMLAttributes<HTMLElement>,
      option: SelectionsFilterOption,
      state: boolean,
    ) => {
      const href =
        router.origin +
        router.history.createHref(
          router.buildLocation({
            to: ".",
            params: true,
            hash: true,
            search: (cur) => ({
              ...cur,
              ...(option == "bookmarked" && { bookmarked: state }),
              ...(option == "unvisited" && { unvisited: state }),
            }),
          }).href,
        )

      return (
        <a
          {...props}
          href={href}
          onClick={(e) => {
            e.preventDefault()
            navigate({
              to: ".",
              params: true,
              state: true,
              hash: true,
              search: (cur) => ({
                ...cur,
                ...(option == "bookmarked" && { bookmarked: state }),
                ...(option == "unvisited" && { unvisited: state }),
              }),
              replace: true,
            })
          }}
        />
      )
    },
    [router, navigate],
  )

  return (
    <SelectionsFilter
      {...props}
      renderButton={renderButton}
      value={selectionsOpts}
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
