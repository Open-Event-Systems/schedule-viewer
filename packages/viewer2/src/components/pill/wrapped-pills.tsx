import {
  ItemDetails,
  ItemPills,
  useIsSelected,
  useSelectionCount,
  useSetSelected,
  type ItemDetailsButtonOption,
  type ItemDetailsProps,
  type ItemPillProps,
} from "@open-event-systems/schedule-react"
import { useViewerConfig } from "../../config.js"
import { useCallback, useMemo, type AllHTMLAttributes } from "react"

export const WrappedItemPill = (
  props: ItemPillProps & {
    tagIndicatorFunc: (tags: Iterable<string>) => string | undefined
    href?: string
  },
) => {
  const { tagIndicatorFunc, href, ...other } = props
  const config = useViewerConfig()
  const indicator = useMemo(
    () => tagIndicatorFunc(props.item.tags ?? []),
    [props.item.tags, tagIndicatorFunc],
  )

  const renderBody = useCallback(
    (props: AllHTMLAttributes<HTMLElement>) => <a href={href} {...props} />,
    [href],
  )

  return (
    <ItemPills.Pill
      {...other}
      tags={config.tags}
      indicator={indicator}
      renderBody={renderBody}
    />
  )
}

export const WrappedItemDetails = (props: ItemDetailsProps) => {
  const { ...other } = props

  const config = useViewerConfig()
  const { data: bookmarked } = useIsSelected("bookmarks", props.itemId)
  const { data: count } = useSelectionCount("bookmarks", props.itemId)
  const setBookmarked = useSetSelected("bookmarks")

  const onSelect = useCallback(
    (o: ItemDetailsButtonOption) => {
      if (o == "bookmark") {
        return setBookmarked(props.itemId, !bookmarked)
      }
    },
    [setBookmarked, bookmarked, props.itemId],
  )

  return (
    <ItemDetails
      {...other}
      bookmarked={bookmarked}
      onSelectOption={onSelect}
      bookmarkCount={count}
      tagEntries={config.tags}
    />
  )
}
